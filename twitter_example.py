"""
Example usage of Twitter Retrieval Module
Simple examples demonstrating how to use the TwitterRetrieval class
"""

from twitter_retrieval import TwitterRetrieval


def example_basic_search():
    """Basic search example"""
    print("\n=== Example 1: Basic Search ===\n")
    
    twitter = TwitterRetrieval()
    
    # Search for tweets
    result = twitter.search_tweets("Python programming", max_results=5)
    
    # Display results
    twitter.display_tweets(result)


def example_trending_topic():
    """Search for trending topic"""
    print("\n=== Example 2: Trending Topic ===\n")
    
    twitter = TwitterRetrieval()
    
    # Search for a trending topic
    result = twitter.search_tweets("AI news", max_results=10)
    
    # Access individual tweets
    for tweet in result['tweets']:
        print(f"{tweet['author']}: {tweet['text'][:100]}...")
        print(f"Likes: {tweet['likes']}, Retweets: {tweet['retweets']}\n")


def example_save_to_json():
    """Search and save results to JSON"""
    print("\n=== Example 3: Save to JSON ===\n")
    
    import json
    from datetime import datetime
    
    twitter = TwitterRetrieval()
    
    # Search
    result = twitter.search_tweets("machine learning", max_results=15)
    
    # Save to JSON file
    filename = f"tweets_ml_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Saved {len(result['tweets'])} tweets to {filename}")


def example_filter_by_engagement():
    """Search and filter by engagement metrics"""
    print("\n=== Example 4: Filter by Engagement ===\n")
    
    twitter = TwitterRetrieval()
    
    # Search
    result = twitter.search_tweets("technology", max_results=20)
    
    # Filter tweets with high engagement (>100 likes)
    popular_tweets = [
        tweet for tweet in result['tweets'] 
        if tweet['likes'] > 100
    ]
    
    print(f"Found {len(popular_tweets)} tweets with >100 likes:")
    for tweet in popular_tweets[:5]:
        print(f"\n{tweet['author']}: {tweet['text'][:100]}...")
        print(f"❤️ {tweet['likes']} likes | 🔁 {tweet['retweets']} retweets")


def example_multiple_searches():
    """Perform multiple searches"""
    print("\n=== Example 5: Multiple Searches ===\n")
    
    twitter = TwitterRetrieval()
    
    topics = ["Python", "JavaScript", "AI"]
    
    for topic in topics:
        print(f"\n--- Searching for: {topic} ---")
        result = twitter.search_tweets(topic, max_results=3)
        print(f"Found {result['totalResults']} tweets\n")


if __name__ == "__main__":
    print("🐦 Twitter Retrieval Examples")
    print("="*80)
    
    # Run examples
    try:
        # Uncomment the example you want to run:
        
        example_basic_search()
        # example_trending_topic()
        # example_save_to_json()
        # example_filter_by_engagement()
        # example_multiple_searches()
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
