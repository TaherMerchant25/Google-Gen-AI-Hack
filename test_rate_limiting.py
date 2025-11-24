"""
Rate Limiting Test for Twitter Retrieval
Tests the rate limiting features and error handling
"""

from twitter_retrieval import TwitterRetrieval
import time


def test_rate_limiting():
    """Test rate limiting with multiple rapid requests"""
    print("="*60)
    print("Testing Rate Limiting Features")
    print("="*60)
    
    # Initialize with shorter wait time for testing
    twitter = TwitterRetrieval(rate_limit_wait=30)
    
    print("\n1️⃣  Checking rate limit status...")
    try:
        status = twitter.get_rate_limit_status()
        print(f"   Rate Limit: {status.get('remaining', '?')}/{status.get('limit', '?')}")
        if status.get('reset_time'):
            print(f"   Resets at: {status['reset_time']}")
    except Exception as e:
        print(f"   ⚠️  Could not check status: {e}")
    
    print("\n2️⃣  Testing single search with rate limiting...")
    try:
        result = twitter.search_tweets("Python", max_results=5, max_retries=3)
        print(f"   ✅ Found {len(result['tweets'])} tweets")
        if result['tweets']:
            print(f"   Top tweet: {result['tweets'][0]['text'][:60]}...")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n3️⃣  Testing rapid consecutive searches...")
    queries = ["AI", "machine learning", "data science"]
    
    for i, query in enumerate(queries, 1):
        print(f"\n   Search {i}/3: '{query}'")
        try:
            start_time = time.time()
            result = twitter.search_tweets(query, max_results=5, max_retries=2)
            elapsed = time.time() - start_time
            print(f"   ✅ Found {len(result['tweets'])} tweets in {elapsed:.1f}s")
        except Exception as e:
            print(f"   ⚠️  Rate limited or error: {type(e).__name__}")
            if "429" in str(e):
                print(f"   💡 This is expected - demonstrating auto-retry")
    
    print("\n4️⃣  Checking final rate limit status...")
    try:
        status = twitter.get_rate_limit_status()
        print(f"   Rate Limit: {status.get('remaining', '?')}/{status.get('limit', '?')}")
        print(f"   Requests made: ~{3}")  # Approximate
    except Exception as e:
        print(f"   ⚠️  Could not check status: {e}")
    
    print("\n" + "="*60)
    print("Rate Limiting Test Complete!")
    print("="*60)
    print("\n💡 Tips:")
    print("   - Increase rate_limit_wait if you see many 429 errors")
    print("   - Free tier: ~180 requests per 15 minutes")
    print("   - Script will auto-retry with exponential backoff")
    print("="*60 + "\n")


if __name__ == "__main__":
    try:
        test_rate_limiting()
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
