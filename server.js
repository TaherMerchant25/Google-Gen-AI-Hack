import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// X API credentials from environment variables
const X_API_KEY = process.env.X_API_KEY;
const X_API_SECRET = process.env.X_API_SECRET;

// Validate required environment variables
if (!X_API_KEY || !X_API_SECRET) {
  console.error('❌ Error: X_API_KEY and X_API_SECRET must be set in .env file');
  process.exit(1);
}

// Enable CORS for frontend
app.use(cors());
app.use(express.json());

// OAuth 2.0 Bearer Token (we need to get this first)
let bearerToken = null;

// Function to get OAuth 2.0 Bearer Token
async function getBearerToken() {
  if (bearerToken) return bearerToken;

  try {
    const credentials = Buffer.from(`${X_API_KEY}:${X_API_SECRET}`).toString('base64');
    
    const response = await fetch('https://api.twitter.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    
    if (data.access_token) {
      bearerToken = data.access_token;
      console.log('✅ Successfully obtained Bearer Token');
      return bearerToken;
    } else {
      throw new Error('Failed to obtain bearer token: ' + JSON.stringify(data));
    }
  } catch (error) {
    console.error('Error getting bearer token:', error);
    throw error;
  }
}

// Endpoint to search tweets
app.get('/api/tweets/search', async (req, res) => {
  try {
    const { query, maxResults = 10 } = req.query;

    console.log('Received request - Query:', query, 'MaxResults:', maxResults);
    console.log('Full req.query:', req.query);

    if (!query) {
      console.error('Error: Query parameter is missing');
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const token = await getBearerToken();

    // X API v2 endpoint for searching recent tweets
    const tweetFields = 'created_at,public_metrics,author_id';
    const userFields = 'name,username,verified,verified_type';
    const expansions = 'author_id';
    
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=${Math.min(maxResults, 100)}&tweet.fields=${tweetFields}&user.fields=${userFields}&expansions=${expansions}&sort_order=relevancy`;

    console.log('Fetching tweets for query:', query);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('X API Error:', data);
      return res.status(response.status).json({ 
        error: data.detail || data.title || 'Failed to fetch tweets',
        details: data 
      });
    }

    // Transform the data to match our frontend format
    const tweets = data.data?.map(tweet => {
      const author = data.includes?.users?.find(u => u.id === tweet.author_id);
      return {
        id: tweet.id,
        author: author?.name || 'Unknown',
        username: `@${author?.username || 'unknown'}`,
        text: tweet.text,
        views: tweet.public_metrics?.impression_count || 0,
        likes: tweet.public_metrics?.like_count || 0,
        retweets: tweet.public_metrics?.retweet_count || 0,
        replies: tweet.public_metrics?.reply_count || 0,
        timestamp: new Date(tweet.created_at).toLocaleString(),
        verified: author?.verified || false
      };
    }) || [];

    res.json({
      success: true,
      totalResults: data.meta?.result_count || 0,
      tweets: tweets
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'X API Proxy Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 X API Proxy Server running on http://localhost:${PORT}`);
  console.log(`📡 Frontend should connect to: http://localhost:${PORT}/api/tweets/search`);
});
