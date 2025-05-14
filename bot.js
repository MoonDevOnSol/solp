const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Telegram Bot token (replace with your token)
const token = '8157383264:AAEUx0ZXjZB74NOyxWYn-aP7VnUL9REE8uw';
const bot = new TelegramBot(token, { polling: true });

// Admin user ID (replace with the actual admin's Telegram user ID)
const adminId = 'YOUR_ADMIN_USER_ID';

// Manually set PooCoin price (admin can update this)
let POOCOIN_PRICE = 100;  // Update this value manually when needed

// Price alerts array to store user alerts
let priceAlerts = [];

// Command to fetch current Solana price from Binance, Kraken, and FTX
async function fetchPriceFromExchange() {
  try {
    const binance = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT');
    const kraken = await axios.get('https://api.kraken.com/0/public/Ticker?pair=SOLUSD');
    const ftx = await axios.get('https://ftx.com/api/markets/SOL/USDT');
    return {
      binance: binance.data.price,
      kraken: kraken.data.result.SOLUSD.c[0],
      ftx: ftx.data.result.price,
    };
  } catch (error) {
    console.error(error);
    return {
      binance: 'Error fetching price from Binance',
      kraken: 'Error fetching price from Kraken',
      ftx: 'Error fetching price from FTX',
    };
  }
}

// Command to show Solana price from multiple exchanges
bot.onText(/\/price/, async (msg) => {
  const chatId = msg.chat.id;
  const prices = await fetchPriceFromExchange();
  const priceMessage = `
Solana (SOL) Price:
- Binance: $${prices.binance}
- Kraken: $${prices.kraken}
- FTX: $${prices.ftx}
- PooCoin (Manual): $${POOCOIN_PRICE}
To update the price, use the admin panel.
  `;
  bot.sendMessage(chatId, priceMessage);
});

// Command to set price alert
bot.onText(/\/setalert (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const alertPrice = parseFloat(match[1]);
  priceAlerts.push({ chatId, alertPrice });
  bot.sendMessage(chatId, `Price alert set for $${alertPrice} SOL.`);
});

// Command to list all price alerts
bot.onText(/\/alerts/, (msg) => {
  const chatId = msg.chat.id;
  if (priceAlerts.length > 0) {
    let alertMessage = 'Active Price Alerts:';
    priceAlerts.forEach((alert) => {
      alertMessage += `\n- $${alert.alertPrice} for user ${alert.chatId}`;
    });
    bot.sendMessage(chatId, alertMessage);
  } else {
    bot.sendMessage(chatId, 'No active price alerts.');
  }
});

// Command to show Solana staking info
bot.onText(/\/staking/, (msg) => {
  const chatId = msg.chat.id;
  const stakingInfo = `
Solana Staking Info:
1. [Stake Solana](https://www.sollet.io/)
2. [Solana Docs](https://docs.solana.com/)
3. [Solana Staking Overview](https://www.solana.com/staking)
  `;
  bot.sendMessage(chatId, stakingInfo);
});

// Command to check Solana wallet balance
bot.onText(/\/checkbalance (\S+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const walletAddress = match[1];
  const explorerLink = `https://explorer.solana.com/address/${walletAddress}`;
  bot.sendMessage(chatId, `Check your wallet balance here: ${explorerLink}`);
});

// Command to fetch Solana news
bot.onText(/\/solanadigest/, (msg) => {
  const chatId = msg.chat.id;
  const newsLink = 'https://cointelegraph.com/tags/solana';
  bot.sendMessage(chatId, `Read the latest Solana news here: ${newsLink}`);
});

// Command for Solana social media links
bot.onText(/\/solanasocials/, (msg) => {
  const chatId = msg.chat.id;
  const socials = `
Official Solana Social Media:
- [Twitter](https://twitter.com/solana)
- [Discord](https://discord.com/invite/solana)
- [Reddit](https://www.reddit.com/r/solana/)
  `;
  bot.sendMessage(chatId, socials);
});

// Command to refer a user (referral system)
let referralCount = {};
bot.onText(/\/refer/, (msg) => {
  const chatId = msg.chat.id;
  if (!referralCount[chatId]) {
    referralCount[chatId] = 1;
  } else {
    referralCount[chatId]++;
  }
  bot.sendMessage(chatId, `You have referred ${referralCount[chatId]} people.`);
});

// Command for educational tips
bot.onText(/\/tips/, (msg) => {
  const chatId = msg.chat.id;
  const tips = `
Solana Tips:
1. Always back up your Solana private key securely.
2. Staking Solana helps secure the network and earns rewards.
3. Never share your private key with anyone!
  `;
  bot.sendMessage(chatId, tips);
});

// User joins the bot, send a warm welcome message
bot.on('new_chat_members', (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
Welcome to the Solana community! 🚀

Here you can check:
- Current Solana price from multiple exchanges
- Set price alerts for Solana
- Explore staking and Solana social media links
- Learn more about Solana

Commands:
- /price: Get Solana price from multiple exchanges
- /setalert <price>: Set price alerts for Solana
- /alerts: List active price alerts
- /staking: Solana staking info
- /checkbalance <wallet_address>: Check Solana wallet balance
- /solanadigest: Solana news
- /solanasocials: Solana social media links
- /refer: Check referral count
- /tips: Solana educational tips
  `;
  bot.sendMessage(chatId, welcomeMessage);
});
