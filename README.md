# Yeynar Bot

> **"Neynar for the Common Man"**

Yeynar is a Farcaster bot that democratizes access to powerful Farcaster data and analytics. Simply mention @yeynar with your question, and get instant insights powered by Neynar API and Gemini AI.

## What is Yeynar?

Just as Neynar democratized Farcaster data for developers, Yeynar democratizes it for everyday users. No API keys, no coding required—just natural language questions on Farcaster.

## Features

### 🔍 User Discovery & Analytics
- Get user profiles and stats
- Search for users by name or interest
- Find power users and influencers
- Discover who to follow

### 📊 Cast Analytics
- Search casts by keyword or topic
- Find trending content
- Get cast threads and conversations
- Analyze engagement metrics

### 📈 Feeds & Trending
- View personalized feeds
- Discover trending casts
- Explore channel feeds
- Get following feed updates

### 👥 Social Graph
- See followers and following
- Get follow suggestions
- Analyze social connections
- Discover communities

### 🏆 Channel Insights
- Search and discover channels
- Get channel analytics
- View channel feeds
- Find active communities

### ⛓️ Onchain Data
- Check token balances
- View NFT ownership
- Analyze onchain activity

### 🔔 Notifications
- Get your latest notifications
- Track mentions and replies
- Monitor engagement

## How to Use

Simply mention @yeynar on Farcaster with your question:

### Example Queries

**User Stats:**
```
@yeynar show me stats for @dwr
@yeynar who are the top casters today?
@yeynar find users interested in AI
```

**Content Discovery:**
```
@yeynar what's trending?
@yeynar search for casts about crypto
@yeynar show me recent casts from @vitalik
```

**Social Graph:**
```
@yeynar who should I follow?
@yeynar show me followers of @dan
@yeynar find people in the /yeynar channel
```

**Channel Analytics:**
```
@yeynar show me analytics for /farcaster
@yeynar what channels are trending?
@yeynar find channels about DeFi
```

**Onchain Data:**
```
@yeynar show token balances for @username
@yeynar what NFTs does @user own?
```

## Technology Stack

- **Neynar API** - Complete Farcaster data access
- **Google Gemini AI** - Natural language understanding and response generation
- **Node.js** - Runtime environment
- **Farcaster** - Decentralized social protocol

## Architecture

```
User mentions @yeynar
        ↓
Bot detects mention
        ↓
Gemini AI analyzes query
        ↓
Determines Neynar API endpoint
        ↓
Fetches data from Neynar
        ↓
Gemini AI formats response
        ↓
Bot replies to user
```

## Setup (For Developers)

### Prerequisites

- Node.js 18+ installed
- Neynar API key ([get one here](https://dev.neynar.com/))
- Google Gemini API key ([get one here](https://aistudio.google.com/app/apikey))
- Farcaster account for the bot
- Signer UUID for posting (create at [Neynar Dev Portal](https://dev.neynar.com/))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/nektaronbase-cell/yeynar-bot.git
cd yeynar-bot
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys and FID
```

4. Run the bot:
```bash
pnpm start
```

### Environment Variables

- `NEYNAR_API_KEY` - Your Neynar API key
- `GEMINI_API_KEY` - Your Google Gemini API key
- `YEYNAR_FID` - The Farcaster ID (FID) of your @yeynar account
- `YEYNAR_SIGNER_UUID` - Signer UUID for posting replies

## Deployment

### Option 1: Run Locally
```bash
pnpm start
```

### Option 2: Deploy to Cloud

**Railway:**
1. Push code to GitHub
2. Connect repository to Railway
3. Add environment variables
4. Deploy!

**Render:**
1. Create new Web Service
2. Connect GitHub repository
3. Set environment variables
4. Deploy as background worker

**Fly.io:**
```bash
fly launch
fly secrets set NEYNAR_API_KEY=xxx GEMINI_API_KEY=xxx YEYNAR_FID=xxx
fly deploy
```

## Supported Neynar API Endpoints

The bot intelligently routes queries to the appropriate Neynar API endpoints:

- `/user/bulk` - User profiles
- `/user/search` - User search
- `/cast/search` - Cast search
- `/feed/trending` - Trending content
- `/feed/user/{fid}/casts` - User feeds
- `/feed/channels` - Channel feeds
- `/followers` - Follower lists
- `/following` - Following lists
- `/channel/search` - Channel search
- `/notifications` - User notifications
- And many more!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Related Projects

- **Yeynar Token** - [github.com/nektaronbase-cell/yeynar-token](https://github.com/nektaronbase-cell/yeynar-token)
- **Yeynar Frame** - [github.com/nektaronbase-cell/yeynar-farcaster-frame](https://github.com/nektaronbase-cell/yeynar-farcaster-frame)

## License

MIT

## Support

For questions or issues:
- Open an issue on GitHub
- Mention @yeynar on Farcaster
- Join the /yeynar channel

---

**Built with ❤️ for the Farcaster community**

*Making powerful data accessible to everyone*
