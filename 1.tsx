import React, { useState } from 'react';
import { Search, Newspaper, Twitter, ExternalLink, Calendar, TrendingUp, Eye, Heart, MessageCircle } from 'lucide-react';
import { Instagram } from "lucide-react";

export default function NewsRetriever() {
  const [activeTab, setActiveTab] = useState('news');
  const [searchQuery, setSearchQuery] = useState('');
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_NEWSAPI_KEY || '');
  const [newsResults, setNewsResults] = useState([]);
  const [tweetResults, setTweetResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [topK, setTopK] = useState(10);
  const [instaResults, setInstaResults] = useState([]);
  
  // API Proxy URL from environment
  const API_PROXY_URL = import.meta.env.VITE_API_PROXY_URL || 'http://localhost:3001';

  const searchNewsAPI = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    if (!apiKey.trim()) {
      setError('Please enter your NewsAPI key');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // NewsAPI endpoint - using 'everything' for specific searches
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`;
      console.log('Fetching from NewsAPI:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to fetch news');
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      console.log('Articles count:', data.articles?.length);
      console.log('Total results:', data.totalResults);
      
      setNewsResults(data.articles || []);
      
      if (data.articles?.length === 0) {
        setError('No articles found for this query');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Error fetching news. Please check your API key.');
      setNewsResults([]);
    } finally {
      setLoading(false);
    }
  };

  const searchTwitter = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const url = `${API_PROXY_URL}/api/tweets/search?query=${encodeURIComponent(searchQuery)}&maxResults=${topK}`;
      console.log('Fetching tweets from:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch tweets');
      }
      
      const data = await response.json();
      console.log('Tweet data:', data);
      console.log('Tweets count:', data.tweets?.length);
      
      setTweetResults(data.tweets || []);
      
      if (data.tweets?.length === 0) {
        setError('No tweets found for this query. Try a different search term.');
      } else {
        setError(`✅ Found ${data.totalResults} real tweets from X API`);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Error fetching tweets. Make sure the proxy server is running on port 3001.');
      setTweetResults([]);
    } finally {
      setLoading(false);
    }
  };

  const searchInstagram = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a search query");
      return;
    }

    setLoading(true);
    setError("");
    setInstaResults([]);

    try {
      const url = `${API_PROXY_URL}/api/instagram/search?query=${encodeURIComponent(searchQuery)}`;
      console.log("Fetching Instagram posts:", url);

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch Instagram posts");

      const data = await response.json();
      setInstaResults(data.posts || []);
      if (data.posts.length === 0) setError("No Instagram posts found.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = () => {
    if (activeTab === 'news') searchNewsAPI();
    else if (activeTab === 'twitter') searchTwitter();
    else searchInstagram();
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">News & Social Media Retriever</h1>
          <p className="text-slate-300">Search news articles and social media posts by keyword</p>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-4 mb-6 justify-center">
          <button
            onClick={() => setActiveTab('news')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'news'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Newspaper size={20} />
            NewsAPI
          </button>
          <button
            onClick={() => setActiveTab('twitter')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'twitter'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Twitter size={20} />
            X/Twitter API
          </button>
          <button
            onClick={() => setActiveTab("instagram")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg ${
              activeTab === "instagram" ? "bg-blue-600" : "bg-slate-700"
            }`}
          >
            <Instagram size={18} /> Instagram
          </button>
        </div>

        {/* API Key Input (only for NewsAPI) */}
        {activeTab === 'news' && (
          <div className="bg-slate-800 rounded-lg p-4 mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              NewsAPI Key (Get free key at newsapi.org)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your NewsAPI key"
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter keywords to search..."
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            {activeTab === 'twitter' && (
              <input
                type="number"
                value={topK}
                onChange={(e) => setTopK(Math.max(1, Math.min(50, parseInt(e.target.value) || 10)))}
                placeholder="Top K"
                min="1"
                max="50"
                className="w-24 px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
            )}
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-semibold transition flex items-center gap-2"
            >
              <Search size={20} />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {error && (
            <div className={`p-3 rounded-lg ${error.includes('⚠️') ? 'bg-yellow-900/30 text-yellow-300' : 'bg-red-900/30 text-red-300'}`}>
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {activeTab === 'news' && newsResults.length > 0 && (
            <div className="space-y-4">
              {newsResults.map((article, idx) => (
                <div key={idx} className="bg-slate-800 rounded-lg p-6 hover:bg-slate-750 transition">
                  <div className="flex gap-4">
                    {article.image && (
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-48 h-32 object-cover rounded-lg"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{article.title}</h3>
                      <p className="text-slate-300 mb-3">{article.description}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="font-medium">{article.source.name}</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </span>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                        >
                          <ExternalLink size={14} />
                          Read Full Article
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'twitter' && tweetResults.length > 0 && (
            <div className="space-y-4">
              {tweetResults.map((tweet) => (
                <div key={tweet.id} className="bg-slate-800 rounded-lg p-6 hover:bg-slate-750 transition">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center text-white font-bold">
                      {tweet.author[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-white">{tweet.author}</span>
                        {tweet.verified && (
                          <span className="text-blue-400">✓</span>
                        )}
                        <span className="text-slate-400">{tweet.username}</span>
                        <span className="text-slate-500">· {tweet.timestamp}</span>
                      </div>
                      <p className="text-white mb-4">{tweet.text}</p>
                      <div className="flex items-center gap-6 text-slate-400">
                        <span className="flex items-center gap-1">
                          <Eye size={16} />
                          {formatNumber(tweet.views)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart size={16} />
                          {formatNumber(tweet.likes)}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp size={16} />
                          {formatNumber(tweet.retweets)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={16} />
                          {formatNumber(tweet.replies)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === "instagram" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {instaResults.map((post, i) => (
                <div
                  key={i}
                  className="bg-slate-800 rounded-xl overflow-hidden shadow-md border border-slate-700 hover:scale-[1.01] transition-all"
                >
                  {post.isVideo ? (
                    <video src={post.mediaUrl} controls className="w-full h-64 object-cover" />
                  ) : (
                    <img src={post.mediaUrl} alt="Insta post" className="w-full h-64 object-cover" />
                  )}
                  <div className="p-4">
                    <p className="font-semibold text-lg mb-2">@{post.username}</p>
                    <p className="text-slate-300 text-sm mb-3 line-clamp-3">{post.caption}</p>

                    <div className="flex justify-between text-slate-400 text-sm">
                      <span>❤️ {post.likes}</span>
                      <span>💬 {post.comments}</span>
                      {post.isVideo && <span>👀 {post.views}</span>}
                    </div>

                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(post.timestamp).toLocaleString()}
                    </p>

                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 mt-2 inline-block hover:underline"
                    >
                      View on Instagram →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center mt-6">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-400"></div>
            </div>
          )}
        </div>

        {/* Instructions */}
        {newsResults.length === 0 && tweetResults.length === 0 && !loading && (
          <div className="bg-slate-800 rounded-lg p-8 text-center">
            <div className="text-slate-400 mb-4">
              {activeTab === 'news' ? (
                <>
                  <Newspaper size={48} className="mx-auto mb-4 text-slate-500" />
                  <h3 className="text-xl font-semibold text-white mb-2">NewsAPI Setup</h3>
                  <p className="mb-2">1. Get your free API key from <a href="https://newsapi.org/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">newsapi.org</a></p>
                  <p className="mb-2">2. Enter your API key above (or use the default)</p>
                  <p className="mb-2">3. Search for specific topics like "Virat Kohli", "Tesla", "AI", etc.</p>
                  <p className="text-sm text-slate-500 mt-2">Note: NewsAPI works best with specific queries</p>
                </>
              ) : (
                <>
                  <Twitter size={48} className="mx-auto mb-4 text-slate-500" />
                  <h3 className="text-xl font-semibold text-white mb-2">X/Twitter Real-Time Search</h3>
                  <p className="mb-2">Search for real tweets from X (Twitter) using the X API v2</p>
                  <p className="mb-2">Enter a search term and click Search to find recent tweets</p>
                  <p className="text-sm text-slate-500 mt-2">Note: Make sure the proxy server is running (npm run server)</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}