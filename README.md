# News & Social Media Retriever

A modern web application that retrieves news articles from NewsAPI and real-time tweets from X (Twitter) API.

## Features

- 🗞️ **NewsAPI Integration** - Search for news articles on any topic
- 🐦 **X (Twitter) API Integration** - Retrieve real-time tweets with engagement metrics
- 📊 **Rich Analytics** - View likes, retweets, replies, and impressions
- 🎨 **Modern UI** - Built with React, TypeScript, and Tailwind CSS
- 🔒 **Secure** - Environment variables for API keys

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- NewsAPI API Key ([Get one here](https://newsapi.org/))
- X (Twitter) API credentials ([Get them here](https://developer.twitter.com/))

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd GoogleGenAI
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# NewsAPI Configuration
VITE_NEWSAPI_KEY=your_newsapi_key_here

# X (Twitter) API Configuration
X_API_KEY=your_x_api_key_here
X_API_SECRET=your_x_api_secret_here

# Server Configuration
PORT=3001
VITE_API_PROXY_URL=http://localhost:3001
```

### 4. Run the application

You can run both the frontend and backend simultaneously:

```bash
npm start
```

Or run them separately:

**Backend (X API Proxy Server):**
```bash
npm run server
```

**Frontend (React App):**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Usage

### Searching News Articles

1. Click on the "NewsAPI" tab
2. Enter a search query (e.g., "Virat Kohli", "Tesla", "AI")
3. Click "Search"
4. View articles with images, descriptions, and sources

### Searching Tweets

1. Click on the "X/Twitter API" tab
2. Enter a search query
3. Adjust the number of results using the "Top K" input (1-50)
4. Click "Search"
5. View tweets with engagement metrics (views, likes, retweets, replies)

## API Endpoints

### X API Proxy Server

**GET** `/api/tweets/search`

Query Parameters:
- `query` (required) - Search term
- `maxResults` (optional) - Number of results (default: 10, max: 100)

Response:
```json
{
  "success": true,
  "totalResults": 10,
  "tweets": [...]
}
```

**GET** `/api/health`

Health check endpoint.

## Project Structure

```
GoogleGenAI/
├── src/
│   └── (React components)
├── server.js              # X API proxy server
├── 1.tsx                  # Main React component
├── index.html             # HTML entry point
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── .env                   # Environment variables (not committed)
├── .env.example           # Example environment file
├── .gitignore             # Git ignore rules
└── package.json           # Dependencies and scripts

```

## Technologies Used

- **Frontend:**
  - React 19
  - TypeScript
  - Tailwind CSS
  - Vite
  - Lucide React (icons)

- **Backend:**
  - Express.js
  - Node Fetch
  - CORS
  - dotenv

## Security

- ✅ API keys stored in `.env` file (not committed to git)
- ✅ `.gitignore` configured to exclude sensitive files
- ✅ Environment variable validation on server startup
- ✅ CORS enabled for frontend communication
- ✅ OAuth 2.0 Bearer Token authentication for X API

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_NEWSAPI_KEY` | NewsAPI API key | Yes |
| `X_API_KEY` | X (Twitter) API key | Yes |
| `X_API_SECRET` | X (Twitter) API secret | Yes |
| `PORT` | Server port (default: 3001) | No |
| `VITE_API_PROXY_URL` | Proxy server URL | No |

## Troubleshooting

### Server won't start

- Check if port 3001 is already in use
- Verify environment variables are set correctly
- Run: `npm run server` with error output

### No articles/tweets found

- Verify your API keys are valid and active
- Check API rate limits
- Try different search queries
- Check browser console for errors

### CORS errors

- Ensure the proxy server is running
- Verify `VITE_API_PROXY_URL` matches the server URL

## License

MIT

## Contributing

Pull requests are welcome! Please ensure:
- API keys are not committed
- Code follows existing style
- Tests pass (if applicable)

## Support

For issues or questions, please open a GitHub issue.
