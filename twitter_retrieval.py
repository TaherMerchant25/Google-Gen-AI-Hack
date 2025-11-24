"""
Twitter/X API Retrieval Module
Replicates the Twitter search functionality from 1.tsx and server.js
"""

import os
import json
import base64
import time
import requests
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class TwitterRetrieval:
    """
    Twitter/X API retrieval class that handles OAuth 2.0 authentication
    and tweet searching using X API v2
    """
    
    def __init__(self, rate_limit_wait: int = 60):
        """
        Initialize with API credentials from environment variables
        
        Args:
            rate_limit_wait: Seconds to wait when rate limit is hit (default: 60)
        """
        self.api_key = os.getenv('X_API_KEY')
        self.api_secret = os.getenv('X_API_SECRET')
        self.bearer_token = None
        self.rate_limit_wait = rate_limit_wait
        self.last_request_time = None
        self.min_request_interval = 1.0  # Minimum seconds between requests
        
        if not self.api_key or not self.api_secret:
            raise ValueError("X_API_KEY and X_API_SECRET must be set in .env file")
    
    def get_bearer_token(self) -> str:
        """
        OAuth 2.0 Authentication - Get Bearer Token
        Replicates the getBearerToken() function from server.js
        """
        # Create base64 encoded credentials
        credentials = f"{self.api_key}:{self.api_secret}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        
        # OAuth 2.0 token endpoint
        url = "https://api.twitter.com/oauth2/token"
        
        headers = {
            "Authorization": f"Basic {encoded_credentials}",
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        }
        
        data = {
            "grant_type": "client_credentials"
        }
        
        try:
            response = requests.post(url, headers=headers, data=data)
            response.raise_for_status()
            
            token_data = response.json()
            self.bearer_token = token_data.get('access_token')
            
            print("✅ Bearer token obtained successfully")
            return self.bearer_token
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Error getting bearer token: {e}")
            raise
    
    def get_rate_limit_status(self) -> Dict:
        """
        Check current rate limit status for search endpoint
        
        Returns:
            Dictionary with rate limit information
        """
        if not self.bearer_token:
            self.get_bearer_token()
        
        url = "https://api.twitter.com/2/tweets/search/recent"
        headers = {"Authorization": f"Bearer {self.bearer_token}"}
        
        try:
            # Make a minimal request to check headers
            response = requests.get(url, headers=headers, params={"query": "test", "max_results": 10})
            
            return {
                "limit": response.headers.get('x-rate-limit-limit', 'Unknown'),
                "remaining": response.headers.get('x-rate-limit-remaining', 'Unknown'),
                "reset": response.headers.get('x-rate-limit-reset', 'Unknown'),
                "reset_time": datetime.fromtimestamp(int(response.headers.get('x-rate-limit-reset', 0))) if response.headers.get('x-rate-limit-reset') else None
            }
        except Exception as e:
            print(f"⚠️  Could not fetch rate limit status: {e}")
            return {}
    
    def search_tweets(self, query: str, max_results: int = 10, max_retries: int = 3) -> Dict:
        """
        Search for recent tweets using X API v2 with rate limiting
        Replicates the /api/tweets/search endpoint from server.js
        
        Args:
            query: Search query string
            max_results: Number of tweets to retrieve (1-100, default 10)
            max_retries: Number of retries for rate limit errors (default 3)
        
        Returns:
            Dictionary containing tweets and metadata
        """
        # Get bearer token if not already obtained
        if not self.bearer_token:
            self.get_bearer_token()
        
        # Rate limiting - wait between requests
        if self.last_request_time:
            elapsed = time.time() - self.last_request_time
            if elapsed < self.min_request_interval:
                wait_time = self.min_request_interval - elapsed
                print(f"⏳ Rate limiting: waiting {wait_time:.1f}s...")
                time.sleep(wait_time)
        
        # X API v2 search endpoint
        url = "https://api.twitter.com/2/tweets/search/recent"
        
        headers = {
            "Authorization": f"Bearer {self.bearer_token}"
        }
        
        # Query parameters - includes tweet metrics
        params = {
            "query": query,
            "max_results": min(max(max_results, 10), 100),  # Clamp between 10-100
            "tweet.fields": "created_at,public_metrics,author_id",
            "user.fields": "name,username,verified",
            "expansions": "author_id"
        }
        
        retry_count = 0
        while retry_count <= max_retries:
            try:
                print(f"🔍 Searching for tweets: '{query}'...")
                response = requests.get(url, headers=headers, params=params)
                self.last_request_time = time.time()
                
                # Handle rate limit error specifically
                if response.status_code == 429:
                    retry_count += 1
                    if retry_count > max_retries:
                        raise requests.exceptions.HTTPError(
                            f"429 Client Error: Rate limit exceeded after {max_retries} retries",
                            response=response
                        )
                    
                    # Get reset time from headers if available
                    reset_time = response.headers.get('x-rate-limit-reset')
                    if reset_time:
                        wait_until = datetime.fromtimestamp(int(reset_time))
                        wait_seconds = (wait_until - datetime.now()).total_seconds()
                        wait_seconds = max(wait_seconds, self.rate_limit_wait)
                    else:
                        wait_seconds = self.rate_limit_wait * retry_count
                    
                    print(f"⚠️  Rate limit hit! Waiting {int(wait_seconds)}s before retry {retry_count}/{max_retries}...")
                    time.sleep(wait_seconds)
                    continue
                
                response.raise_for_status()
                
                data = response.json()
                
                # Check if we got any data
                if 'data' not in data or not data['data']:
                    print(f"⚠️  No tweets found for query: '{query}'")
                    return {
                        "tweets": [],
                        "totalResults": 0,
                        "query": query
                    }
                
                # Process response
                processed_tweets = self._process_response(data)
                
                # Sort by views in descending order (most viewed first)
                processed_tweets.sort(key=lambda tweet: tweet['views'], reverse=True)
                
                print(f"✅ Found {len(processed_tweets)} tweets (sorted by views)")
                return {
                    "tweets": processed_tweets,
                    "totalResults": len(processed_tweets),
                    "query": query
                }
                
            except requests.exceptions.HTTPError as e:
                if e.response.status_code == 429:
                    # Rate limit error - will be handled in the loop
                    continue
                else:
                    # Other HTTP errors
                    print(f"❌ HTTP Error: {e}")
                    if hasattr(e.response, 'text'):
                        print(f"Response: {e.response.text}")
                    raise
                    
            except requests.exceptions.RequestException as e:
                print(f"❌ Request Error: {e}")
                if hasattr(e, 'response') and hasattr(e.response, 'text'):
                    print(f"Response: {e.response.text}")
                raise
        
        # If we exit the loop without success, raise an error
        raise requests.exceptions.HTTPError(f"Failed after {max_retries} retries due to rate limiting")
    
    def _process_response(self, data: Dict) -> List[Dict]:
        """
        Process raw X API response into formatted tweet objects
        Replicates response processing from server.js
        
        Args:
            data: Raw response from X API
        
        Returns:
            List of formatted tweet dictionaries
        """
        tweets = []
        
        # Get users data for author information
        users_dict = {}
        if 'includes' in data and 'users' in data['includes']:
            for user in data['includes']['users']:
                users_dict[user['id']] = user
        
        # Process each tweet
        if 'data' in data:
            for tweet in data['data']:
                author_id = tweet.get('author_id')
                author_data = users_dict.get(author_id, {})
                
                metrics = tweet.get('public_metrics', {})
                
                formatted_tweet = {
                    "id": tweet.get('id'),
                    "text": tweet.get('text'),
                    "author": author_data.get('name', 'Unknown'),
                    "username": f"@{author_data.get('username', 'unknown')}",
                    "verified": author_data.get('verified', False),
                    "timestamp": self._format_timestamp(tweet.get('created_at')),
                    "views": metrics.get('impression_count', 0),
                    "likes": metrics.get('like_count', 0),
                    "retweets": metrics.get('retweet_count', 0),
                    "replies": metrics.get('reply_count', 0),
                    "url": f"https://twitter.com/{author_data.get('username', 'i')}/status/{tweet.get('id')}"
                }
                
                tweets.append(formatted_tweet)
        
        return tweets
    
    def _format_timestamp(self, timestamp_str: Optional[str]) -> str:
        """
        Format ISO timestamp to human-readable format
        
        Args:
            timestamp_str: ISO format timestamp string
        
        Returns:
            Formatted timestamp string
        """
        if not timestamp_str:
            return "Unknown"
        
        try:
            dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            now = datetime.now(dt.tzinfo)
            diff = now - dt
            
            # Format relative time
            seconds = diff.total_seconds()
            if seconds < 60:
                return f"{int(seconds)}s ago"
            elif seconds < 3600:
                return f"{int(seconds / 60)}m ago"
            elif seconds < 86400:
                return f"{int(seconds / 3600)}h ago"
            else:
                return f"{int(seconds / 86400)}d ago"
        except Exception:
            return timestamp_str
    
    def display_tweets(self, result: Dict):
        """
        Display tweets in a formatted way (console output)
        Replicates the display functionality from 1.tsx
        
        Args:
            result: Dictionary containing tweets and metadata
        """
        print("\n" + "="*80)
        print(f"📊 Search Results for: '{result['query']}'")
        print(f"Total Results: {result['totalResults']}")
        print("="*80 + "\n")
        
        for i, tweet in enumerate(result['tweets'], 1):
            print(f"Tweet #{i}")
            print(f"👤 {tweet['author']} {tweet['username']}")
            if tweet['verified']:
                print("   ✓ Verified")
            print(f"⏰ {tweet['timestamp']}")
            print(f"\n💬 {tweet['text']}\n")
            print(f"📊 Engagement:")
            print(f"   👁️  Views: {self._format_number(tweet['views'])}")
            print(f"   ❤️  Likes: {self._format_number(tweet['likes'])}")
            print(f"   🔁 Retweets: {self._format_number(tweet['retweets'])}")
            print(f"   💭 Replies: {self._format_number(tweet['replies'])}")
            print(f"🔗 {tweet['url']}")
            print("-" * 80 + "\n")
    
    def _format_number(self, num: int) -> str:
        """
        Format large numbers with K/M suffix
        Replicates formatNumber() from 1.tsx
        
        Args:
            num: Number to format
        
        Returns:
            Formatted number string
        """
        if num >= 1_000_000:
            return f"{num / 1_000_000:.1f}M"
        elif num >= 1_000:
            return f"{num / 1_000:.1f}K"
        else:
            return str(num)


def main():
    """
    Main function - User Input Interface
    Replicates the search functionality from 1.tsx
    """
    print("\n🐦 Twitter/X Tweet Search Tool")
    print("="*80)
    
    try:
        # Initialize Twitter retrieval
        twitter = TwitterRetrieval()
        
        # User Input (replicating 1.tsx input)
        print("\n📝 Enter your search query:")
        search_query = input("Query: ").strip()
        
        if not search_query:
            print("❌ Please enter a search query")
            return
        
        print("\n📊 Number of tweets to retrieve (10-100):")
        try:
            max_results = int(input("Max Results [default=10]: ") or "10")
            max_results = min(max(max_results, 10), 100)
        except ValueError:
            max_results = 10
        
        print(f"\n🔄 Searching for: '{search_query}' (max {max_results} results)...")
        
        # Search tweets (replicates searchTwitter() from 1.tsx)
        result = twitter.search_tweets(search_query, max_results)
        
        # Display results (replicates tweet display from 1.tsx)
        twitter.display_tweets(result)
        
        # Option to save to JSON
        save = input("\n💾 Save results to JSON file? (y/n): ").lower()
        if save == 'y':
            filename = f"tweets_{search_query.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            print(f"✅ Results saved to: {filename}")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
