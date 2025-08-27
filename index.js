require("dotenv").config();
const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const fs = require("fs");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

let lastVideoId = null;
let subscribers = new Set(); // store chat IDs of subscribed users

// Load subscribers from file at startup
if (fs.existsSync("subscribers.json")) {
  const saved = JSON.parse(fs.readFileSync("subscribers.json", "utf-8"));
  subscribers = new Set(saved);
}

if (fs.existsSync("lastVideo.json")) {
  lastVideoId = JSON.parse(fs.readFileSync("lastVideo.json", "utf-8"));
}

function saveLastVideoId(id) {
  fs.writeFileSync("lastVideo.json", JSON.stringify(id));
}

// Save subscribers to file
function saveSubscribers() {
  fs.writeFileSync("subscribers.json", JSON.stringify([...subscribers]));
}

// Add new subscriber
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  if (!subscribers.has(chatId)) {
    subscribers.add(chatId);
    saveSubscribers();
    bot.sendMessage(chatId, "✅ You are now subscribed to video alerts!");
    console.log("New subscriber:", chatId);
  } else {
    bot.sendMessage(chatId, "🫡 You are already subscribed to video alerts!");
  }

  checkNewVideo();
});

bot.onText(/\/check/, (msg) => {
  const chatId = msg.chat.id;
  if (!subscribers.has(chatId)) {
    bot.sendMessage(
      chatId,
      "Please subscribe to the bot either by clicking the start button or using the /start command!"
    );
  } else {
    checkNewVideo(chatId);
  }
});

// Fetch latest video from channel
async function getLatestVideo() {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${process.env.CHANNEL_ID}&maxResults=1&order=date&type=video&key=${process.env.YOUTUBE_API_KEY}`;

  const res = await axios.get(url);
  if (!res.data.items || res.data.items.length === 0) {
    console.log("⚠️ No videos found for this channel");
    return null;
  }

  const latest = res.data.items[0];

  return {
    id: latest.id.videoId,
    title: latest.snippet.title,
    url: `https://www.youtube.com/watch?v=${latest.id.videoId}`,
  };
}

// Check if a new video is uploaded
async function checkNewVideo(chatId = null) {
  try {
    const latest = await getLatestVideo();
    console.log("Latest video:", latest);

    if (latest.id !== lastVideoId) {
      //&& latest.title.includes("//አራዳ ቅዳሜ//")
      if (chatId) {
        await bot.sendMessage(
          chatId,
          `🎬 Guess what! New video uploaded! Enjoy!\n\n📌 *${latest.title}*\n🔗 ${latest.url}`,
          { parse_mode: "Markdown" }
        );
        return;
      }
      lastVideoId = latest.id;
      saveLastVideoId(latest.id);
      for (let chatId of subscribers) {
        await bot.sendMessage(
          chatId,
          `🎬 New video uploaded!\n\n📌 *${latest.title}*\n🔗 ${latest.url}`,
          { parse_mode: "Markdown" }
        );
      }
      console.log("✅ Notifications sent:", latest.title);
    } else {
      if (chatId) {
        await bot.sendMessage(chatId, `😔 No New video uploaded!`, {
          parse_mode: "Markdown",
        });
      }
    }
  } catch (err) {
    console.error("❌ Error checking videos:", err.message);
  }
}

// --- Express server for cron-job.org ---
const app = express();

app.get("/check", async (req, res) => {
  await checkNewVideo();
  res.send("Video check complete");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
