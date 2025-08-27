# 📺 YouTube → Telegram Notifier Bot

A simple Node.js bot that checks for new YouTube uploads from a specific channel and sends Telegram notifications to subscribed users.

I originally built this for my parents, so they get notified only when new **አራዳ ቅዳሜ** episodes are uploaded by the **ebstv worldwide** channel — but it’s generic enough to work with any channel and filter.

---

## 🚀 Features

- Subscribes users via `/start` command in Telegram.
- Notifies subscribers when new videos matching a specific title format are uploaded.
- Persists subscriber list and last video ID (safe across server restarts).
- `/unsubscribe` command lets users opt-out.
- Works on free hosting platforms (e.g., Render) with [cron-job.org](https://cron-job.org) triggering checks.

---

## 🛠️ Tech Stack

- **Node.js**
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- `axios`, `node-telegram-bot-api`, `express`, `dotenv`

---

## 📦 Setup

### 1. Clone repo

```bash
git clone https://github.com/your-username/youtube-telegram-notifier.git
cd youtube-telegram-notifier
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create .env file

```
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
YOUTUBE_API_KEY=your-youtube-api-key
CHANNEL_ID=the-youtube-channel-id
PORT=3000
```

### 4. Run locally

```
node index.js
```

---

## 🌐 Deployment (Render + cron-job.org)

1. **Deploy to Render** as a web service.
2. **Set environment variables** in Render dashboard.
3. **Cron-job.org setup**:
   - Create a job hitting:
     ```
     https://your-render-service.onrender.com/check
     ```
   - **Schedule**: every 30 minutes (or as you like, in my case I did 14 to keep the render service alive).

---

## 🤖 Usage

- In Telegram, start a chat with your bot (from BotFather).
- Run `/start` to subscribe.
- Run `/check` to check for videos manually.
- Whenever a new matching video is uploaded, you’ll get a message like:

```
🎬 New video uploaded!

📌 //አራዳ ቅዳሜ//
🔗 https://www.youtube.com/watch?v=XXXXXXXX
```

---

- `subscribers.json` stores chat IDs.
- `lastVideo.json` stores the last notified video ID.
- Both files are **ignored in Git** (`.gitignore`).

---

## ✨ Future Improvements

- Support multiple channels & filters.
- Web UI for managing subscriptions.
- Docker support.
