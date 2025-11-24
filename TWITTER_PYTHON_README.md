# Twitter/X API Retrieval - Python Implementation

## Overview
Python implementation that replicates the Twitter search functionality from `1.tsx` and `server.js`.

## Files Created

### 1. `twitter_retrieval.py`
Main module containing the `TwitterRetrieval` class that handles:
- OAuth 2.0 authentication with X API
- Tweet searching via X API v2
- Response processing and formatting
- Display functionality

### 2. `twitter_example.py`
Example usage file demonstrating:
- Basic search
- Trending topics
- Saving to JSON
- Filtering by engagement
- Multiple searches

### 3. `requirements.txt`
Python dependencies needed to run the module

## Installation

```bash
# Install dependencies
pip install -r requirements.txt
```

## Usage

### Quick Start (Interactive Mode)

```bash
python twitter_retrieval.py
```

This will prompt you to:
1. Enter a search query
2. Specify number of results (10-100)
3. View results in the console
4. Optionally save to JSON

### Programmatic Usage

```python
from twitter_retrieval import TwitterRetrieval

# Initialize with custom rate limit wait time (default 60 seconds)
twitter = TwitterRetrieval(rate_limit_wait=90)

# Search for tweets (with automatic retry on rate limit)
result = twitter.search_tweets(
    "Python programming", 
    max_results=10,
    max_retries=3  # Retry up to 3 times if rate limited
)

# Display results
twitter.display_tweets(result)

# Access raw data
for tweet in result['tweets']:
    print(tweet['text'])
    print(f"Likes: {tweet['likes']}")

# Check rate limit status
status = twitter.get_rate_limit_status()
print(f"Rate limit: {status['remaining']}/{status['limit']}")
```
```

### Run Examples

```bash
python twitter_example.py
```

## Data Flow (Replicates JS Flow)

```
User Input (Python Script)
    ↓
search_tweets("query", max_results)
    ↓
get_bearer_token() - OAuth 2.0
    ↓
X API v2 Request → https://api.twitter.com/2/tweets/search/recent
    ↓
_process_response(data)
    ↓
Sort by views (descending) 📊
    ↓
Return formatted tweets (most viewed first)
    ↓
display_tweets(result)
```

## Response Format

```python
{
    "tweets": [
        {
            "id": "1234567890",
            "text": "Tweet content...",
            "author": "John Doe",
            "username": "@johndoe",
            "verified": True,
            "timestamp": "2h ago",
            "views": 15000,
            "likes": 234,
            "retweets": 45,
            "replies": 12,
            "url": "https://twitter.com/johndoe/status/1234567890"
        }
    ],
    "totalResults": 10,
    "query": "Python programming"
}
```

## Environment Variables

Make sure your `.env` file contains:

```
X_API_KEY=your_api_key_here
X_API_SECRET=your_api_secret_here
```

## Features

✅ OAuth 2.0 authentication
✅ X API v2 integration
✅ Rich tweet metadata (views, likes, retweets, replies)
✅ **Sorted by views in descending order (most viewed first)**
✅ **Rate limiting with automatic retry**
✅ **Smart wait times based on X-Rate-Limit headers**
✅ Verified badge detection
✅ Relative timestamp formatting
✅ Number formatting (1.5K, 2.3M)
✅ Console display with colors/emojis
✅ JSON export capability
✅ Comprehensive error handling

## Comparison with JS Implementation

| Feature | JS (1.tsx + server.js) | Python (twitter_retrieval.py) |
|---------|------------------------|-------------------------------|
| OAuth 2.0 | ✅ | ✅ |
| X API v2 | ✅ | ✅ |
| Search tweets | ✅ | ✅ |
| Format metrics | ✅ | ✅ |
| Display results | ✅ (React UI) | ✅ (Console) |
| Proxy server | ✅ (Express) | ❌ (Direct API) |
| Frontend | ✅ (React) | ❌ (CLI) |

## Examples

### Example 1: Basic Search
```python
from twitter_retrieval import TwitterRetrieval

twitter = TwitterRetrieval()
result = twitter.search_tweets("AI news", max_results=5)
twitter.display_tweets(result)
```

### Example 2: Save to JSON
```python
import json
twitter = TwitterRetrieval()
result = twitter.search_tweets("machine learning", max_results=20)

with open('tweets.json', 'w') as f:
    json.dump(result, f, indent=2)
```

### Example 3: Filter by Engagement
```python
twitter = TwitterRetrieval()
result = twitter.search_tweets("Python", max_results=50)

popular = [t for t in result['tweets'] if t['likes'] > 100]
print(f"Found {len(popular)} popular tweets")
```

## Troubleshooting

**Error: "X_API_KEY and X_API_SECRET must be set"**
- Make sure `.env` file exists with your credentials

**Error: "401 Unauthorized"**
- Check your API credentials are correct
- Ensure your X API access is active

**Error: "429 Too Many Requests"**
- The script now handles this automatically with retry logic
- Default wait time: 60 seconds (configurable)
- Will retry up to 3 times by default
- If still failing:
  - Increase wait time: `TwitterRetrieval(rate_limit_wait=120)`
  - Increase retries: `search_tweets(query, max_retries=5)`
  - Check your rate limit status: `twitter.get_rate_limit_status()`
  - X API free tier limits: ~180 requests per 15 minutes

## Rate Limiting

The module includes intelligent rate limiting:

- **Automatic retry**: Retries up to 3 times when rate limited
- **Smart wait times**: Uses X-Rate-Limit-Reset header when available
- **Minimum interval**: 1 second between requests
- **Configurable**: Set custom wait times and retry counts

```python
# Custom rate limit configuration
twitter = TwitterRetrieval(rate_limit_wait=120)  # Wait 2 minutes on rate limit
result = twitter.search_tweets("AI", max_retries=5)  # Retry up to 5 times
```

## Notes

- Replicates the exact same OAuth 2.0 flow as `server.js`
- Processes responses in the same format as `1.tsx`
- **Results are automatically sorted by views (descending) - most viewed tweets appear first**
- **Handles rate limiting automatically with exponential backoff**
- Can be used as a standalone CLI tool or imported as a module
- No proxy server needed (direct API access)
- Free tier: ~180 requests per 15-minute window
