# Yeynar Bot Deployment Guide

This guide will help you deploy the Yeynar bot to make it available 24/7 for Farcaster users.

## Prerequisites

Before deploying, you need:

1. **Farcaster Account** - Create a @yeynar account on Warpcast or another Farcaster client
2. **Neynar API Key** - Sign up at [dev.neynar.com](https://dev.neynar.com/)
3. **Gemini API Key** - Get one at [Google AI Studio](https://aistudio.google.com/app/apikey)
4. **Signer UUID** - Create a signer for your bot account at Neynar Dev Portal

## Step 1: Get Your Farcaster FID

Your FID (Farcaster ID) is your unique identifier on Farcaster.

**Option A: Check on Warpcast**
1. Go to your profile on Warpcast
2. Your FID is in the URL: `warpcast.com/username` → click profile → URL shows FID

**Option B: Use Neynar API**
```bash
curl -X GET "https://api.neynar.com/v2/farcaster/user/by_username?username=yeynar" \
  -H "x-api-key: YOUR_NEYNAR_API_KEY"
```

## Step 2: Create a Signer

A signer allows your bot to post casts on behalf of your account.

1. Go to [Neynar Developer Portal](https://dev.neynar.com/)
2. Navigate to "Signers"
3. Click "Create Signer"
4. Follow the QR code flow to authorize with your @yeynar account
5. Copy the `signer_uuid` - you'll need this

## Step 3: Set Up Environment Variables

Create a `.env` file with your credentials:

```env
NEYNAR_API_KEY=your_neynar_api_key
GEMINI_API_KEY=your_gemini_api_key
YEYNAR_FID=your_farcaster_fid
YEYNAR_SIGNER_UUID=your_signer_uuid
```

## Deployment Options

### Option 1: Railway (Recommended)

Railway is the easiest way to deploy and keep your bot running 24/7.

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/yeynar-bot.git
git push -u origin main
```

2. **Deploy to Railway:**
   - Go to [railway.app](https://railway.app/)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your yeynar-bot repository
   - Railway will auto-detect Node.js

3. **Add Environment Variables:**
   - Go to your project → Variables
   - Add all four environment variables from your `.env` file
   - Click "Deploy"

4. **Monitor:**
   - View logs in real-time
   - Bot will automatically restart if it crashes
   - Free tier includes $5/month credit

**Cost:** Free tier available, ~$5/month for basic usage

---

### Option 2: Render

Render offers a generous free tier for background workers.

1. **Create `render.yaml`:**
```yaml
services:
  - type: worker
    name: yeynar-bot
    env: node
    buildCommand: pnpm install
    startCommand: pnpm start
    envVars:
      - key: NEYNAR_API_KEY
        sync: false
      - key: GEMINI_API_KEY
        sync: false
      - key: YEYNAR_FID
        sync: false
      - key: YEYNAR_SIGNER_UUID
        sync: false
```

2. **Deploy:**
   - Go to [render.com](https://render.com/)
   - Click "New" → "Background Worker"
   - Connect your GitHub repository
   - Render will detect the configuration
   - Add environment variables
   - Click "Create Background Worker"

**Cost:** Free tier available

---

### Option 3: Fly.io

Fly.io is great for global deployment with low latency.

1. **Install Fly CLI:**
```bash
curl -L https://fly.io/install.sh | sh
```

2. **Login and Launch:**
```bash
fly auth login
fly launch
```

3. **Set Secrets:**
```bash
fly secrets set NEYNAR_API_KEY=xxx
fly secrets set GEMINI_API_KEY=xxx
fly secrets set YEYNAR_FID=xxx
fly secrets set YEYNAR_SIGNER_UUID=xxx
```

4. **Deploy:**
```bash
fly deploy
```

**Cost:** Free tier includes 3 VMs

---

### Option 4: DigitalOcean App Platform

1. **Create App:**
   - Go to [DigitalOcean](https://www.digitalocean.com/)
   - Click "Create" → "Apps"
   - Connect your GitHub repository

2. **Configure:**
   - Select "Worker" as the resource type
   - Set build command: `pnpm install`
   - Set run command: `pnpm start`
   - Add environment variables

3. **Deploy:**
   - Click "Deploy"
   - Monitor logs in the dashboard

**Cost:** $5/month minimum

---

### Option 5: VPS (Advanced)

For full control, deploy to a VPS like DigitalOcean Droplet or AWS EC2.

1. **Set up server:**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Clone repository
git clone https://github.com/yourusername/yeynar-bot.git
cd yeynar-bot
pnpm install
```

2. **Create systemd service:**
```bash
sudo nano /etc/systemd/system/yeynar-bot.service
```

```ini
[Unit]
Description=Yeynar Bot
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/yeynar-bot
ExecStart=/usr/bin/node index.js
Restart=always
Environment=NODE_ENV=production
EnvironmentFile=/home/ubuntu/yeynar-bot/.env

[Install]
WantedBy=multi-user.target
```

3. **Start service:**
```bash
sudo systemctl enable yeynar-bot
sudo systemctl start yeynar-bot
sudo systemctl status yeynar-bot
```

4. **View logs:**
```bash
sudo journalctl -u yeynar-bot -f
```

**Cost:** $4-6/month for basic VPS

---

## Monitoring & Maintenance

### Check Bot Status

**Railway/Render:**
- View logs in the dashboard
- Set up alerts for crashes

**Fly.io:**
```bash
fly logs
fly status
```

**VPS:**
```bash
sudo systemctl status yeynar-bot
sudo journalctl -u yeynar-bot -f
```

### Update Bot

**Railway/Render/Fly.io:**
- Push changes to GitHub
- Platform auto-deploys

**VPS:**
```bash
cd /home/ubuntu/yeynar-bot
git pull
pnpm install
sudo systemctl restart yeynar-bot
```

## Testing

Before going live, test the bot locally:

```bash
pnpm start
```

Then mention @yeynar on Farcaster with a test query like:
```
@yeynar hello!
```

Check the logs to see if the bot detected and processed your mention.

## Troubleshooting

### Bot not responding?

1. **Check logs** - Look for errors in the deployment logs
2. **Verify FID** - Make sure YEYNAR_FID matches your account
3. **Test API keys** - Verify both Neynar and Gemini keys work
4. **Check signer** - Ensure signer is authorized and not revoked

### Rate limiting?

- Neynar has rate limits on the free tier
- Consider upgrading to a paid plan for higher limits
- Add delays between API calls if needed

### Bot crashes?

- Most platforms auto-restart on crash
- Check logs for error messages
- Ensure all dependencies are installed

## Security Best Practices

1. **Never commit `.env` file** - Always use `.gitignore`
2. **Use environment variables** - Never hardcode API keys
3. **Rotate keys regularly** - Generate new API keys periodically
4. **Monitor usage** - Watch for unusual activity
5. **Limit permissions** - Only grant necessary signer permissions

## Cost Estimates

| Platform | Free Tier | Paid Tier |
|----------|-----------|-----------|
| Railway | $5 credit/month | ~$5-10/month |
| Render | Yes (750 hours) | $7/month |
| Fly.io | 3 VMs free | ~$5/month |
| DigitalOcean | No | $5/month |
| VPS | No | $4-6/month |

## Next Steps

1. Deploy the bot using your preferred method
2. Test with a few queries
3. Announce @yeynar on Farcaster!
4. Monitor usage and engagement
5. Iterate based on user feedback

## Support

Need help? 
- Open an issue on GitHub
- Ask in the /yeynar channel on Farcaster
- Check Neynar docs: [docs.neynar.com](https://docs.neynar.com/)

---

**Ready to democratize Farcaster data for everyone!** 🚀
