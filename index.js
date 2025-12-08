import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const YEYNAR_FID = process.env.YEYNAR_FID; // The FID of the @yeynar account
const POLL_INTERVAL = 30000; // Poll every 30 seconds

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

// Neynar API Base URL
const NEYNAR_BASE_URL = 'https://api.neynar.com/v2/farcaster';

// Store processed mentions to avoid duplicates
const processedMentions = new Set();

/**
 * Make a request to Neynar API
 */
async function neynarRequest(endpoint, options = {}) {
    const url = `${NEYNAR_BASE_URL}${endpoint}`;
    const headers = {
        'x-api-key': NEYNAR_API_KEY,
        'Content-Type': 'application/json',
        ...options.headers
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Neynar API error: ${response.status} - ${error}`);
    }

    return await response.json();
}

/**
 * Get mentions of @yeynar
 */
async function getMentions() {
    try {
        // Get notifications for the yeynar account
        const data = await neynarRequest(`/notifications?fid=${YEYNAR_FID}&type=mentions`);
        return data.notifications || [];
    } catch (error) {
        console.error('Error fetching mentions:', error.message);
        return [];
    }
}

/**
 * Analyze user query with Gemini and determine Neynar API action
 */
async function analyzeQuery(query, authorUsername) {
    const prompt = `You are Yeynar, a friendly bot that democratizes Farcaster data access for everyone. 
You have access to all Neynar API endpoints to help users.

User @${authorUsername} asked: "${query}"

Analyze this query and determine:
1. What Neynar API endpoint(s) should be called
2. What parameters are needed
3. How to present the data in a friendly way

Available API categories:
- User data (profiles, stats, search)
- Casts (search, threads, trending)
- Feeds (user feeds, channel feeds, trending)
- Social graph (followers, following, suggestions)
- Channels (discovery, analytics)
- Reactions (likes, recasts)
- Onchain data (tokens, NFTs)
- Notifications

Respond in JSON format:
{
  "action": "api_endpoint_name",
  "params": {key: value},
  "response_template": "how to format the response"
}

If the query is unclear or just a greeting, respond with:
{
  "action": "greeting",
  "response": "friendly greeting message explaining what you can do"
}`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        
        // Extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        return {
            action: 'greeting',
            response: 'Hi! I\'m Yeynar - Neynar for the common man! Ask me about Farcaster users, casts, trending content, or anything else!'
        };
    } catch (error) {
        console.error('Error analyzing query with Gemini:', error.message);
        return {
            action: 'error',
            response: 'Sorry, I had trouble understanding that. Try asking about users, casts, or trending content!'
        };
    }
}

/**
 * Execute Neynar API call based on Gemini analysis
 */
async function executeNeynarAction(action, params) {
    try {
        switch (action) {
            case 'user_profile':
                return await neynarRequest(`/user/bulk?fids=${params.fid || params.fids}`);
            
            case 'user_search':
                return await neynarRequest(`/user/search?q=${encodeURIComponent(params.query)}`);
            
            case 'cast_search':
                return await neynarRequest(`/cast/search?q=${encodeURIComponent(params.query)}&limit=10`);
            
            case 'trending_casts':
                return await neynarRequest(`/feed/trending?limit=10`);
            
            case 'user_feed':
                return await neynarRequest(`/feed/user/${params.fid}/casts?limit=10`);
            
            case 'channel_feed':
                return await neynarRequest(`/feed/channels?channel_ids=${params.channel_id}&limit=10`);
            
            case 'followers':
                return await neynarRequest(`/followers?fid=${params.fid}&limit=20`);
            
            case 'following':
                return await neynarRequest(`/following?fid=${params.fid}&limit=20`);
            
            case 'channel_search':
                return await neynarRequest(`/channel/search?q=${encodeURIComponent(params.query)}`);
            
            case 'user_stats':
                return await neynarRequest(`/user/bulk?fids=${params.fid}`);
            
            default:
                return null;
        }
    } catch (error) {
        console.error(`Error executing action ${action}:`, error.message);
        return null;
    }
}

/**
 * Format API response with Gemini
 */
async function formatResponse(data, template, originalQuery) {
    const prompt = `Format this Farcaster data into a friendly, concise response for a user.

Original query: "${originalQuery}"
Data: ${JSON.stringify(data, null, 2)}
Template guidance: ${template}

Create a response that:
1. Is friendly and conversational
2. Highlights key information
3. Is under 280 characters if possible
4. Uses emojis appropriately
5. Includes relevant usernames with @ prefix

Response:`;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error('Error formatting response:', error.message);
        return 'I found some data but had trouble formatting it. Try asking again!';
    }
}

/**
 * Post a reply cast
 */
async function postReply(parentHash, text, signerUuid) {
    try {
        const data = await neynarRequest('/cast', {
            method: 'POST',
            body: JSON.stringify({
                signer_uuid: signerUuid,
                text: text,
                parent: parentHash
            })
        });
        return data;
    } catch (error) {
        console.error('Error posting reply:', error.message);
        throw error;
    }
}

/**
 * Process a single mention
 */
async function processMention(mention) {
    const castHash = mention.cast?.hash;
    const authorUsername = mention.cast?.author?.username;
    const text = mention.cast?.text || '';
    
    if (!castHash || processedMentions.has(castHash)) {
        return;
    }

    console.log(`\n📨 New mention from @${authorUsername}: "${text}"`);
    processedMentions.add(castHash);

    try {
        // Remove @yeynar from the query
        const query = text.replace(/@yeynar/gi, '').trim();
        
        if (!query) {
            console.log('Empty query, skipping...');
            return;
        }

        // Analyze query with Gemini
        console.log('🤖 Analyzing query with Gemini...');
        const analysis = await analyzeQuery(query, authorUsername);
        console.log('Analysis:', JSON.stringify(analysis, null, 2));

        let responseText;

        if (analysis.action === 'greeting' || analysis.action === 'error') {
            responseText = analysis.response;
        } else {
            // Execute Neynar API call
            console.log(`📡 Calling Neynar API: ${analysis.action}`);
            const apiData = await executeNeynarAction(analysis.action, analysis.params || {});
            
            if (apiData) {
                // Format response with Gemini
                console.log('✨ Formatting response...');
                responseText = await formatResponse(
                    apiData,
                    analysis.response_template || 'Present the data in a friendly way',
                    query
                );
            } else {
                responseText = 'I couldn\'t fetch that data right now. Try again in a moment!';
            }
        }

        // Post reply
        console.log(`💬 Posting reply: "${responseText}"`);
        
        if (!process.env.YEYNAR_SIGNER_UUID) {
            console.log('⚠️  No signer configured, skipping post (would have replied with above message)');
            return;
        }

        await postReply(castHash, responseText, process.env.YEYNAR_SIGNER_UUID);
        console.log('✅ Reply posted successfully!');

    } catch (error) {
        console.error('Error processing mention:', error.message);
    }
}

/**
 * Main bot loop
 */
async function runBot() {
    console.log('🚀 Yeynar Bot starting...');
    console.log('👀 Monitoring mentions of @yeynar...\n');

    while (true) {
        try {
            const mentions = await getMentions();
            
            if (mentions.length > 0) {
                console.log(`Found ${mentions.length} mention(s)`);
                
                // Process mentions in order (oldest first)
                for (const mention of mentions.reverse()) {
                    await processMention(mention);
                    // Small delay between processing
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }

            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));

        } catch (error) {
            console.error('Error in bot loop:', error.message);
            await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
        }
    }
}

// Start the bot
if (!NEYNAR_API_KEY || !GEMINI_API_KEY || !YEYNAR_FID) {
    console.error('❌ Missing required environment variables:');
    console.error('   - NEYNAR_API_KEY');
    console.error('   - GEMINI_API_KEY');
    console.error('   - YEYNAR_FID');
    console.error('   - YEYNAR_SIGNER_UUID (optional, for posting replies)');
    process.exit(1);
}

runBot().catch(console.error);
