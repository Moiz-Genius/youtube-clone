# ⚡ SpeedTube — Ultra-Fast YouTube Web Client

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen.svg?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Server-Express%205-blue.svg?logo=express)](https://expressjs.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Moiz-Genius/youtube-clone/pulls)

**SpeedTube** is a blazing-fast, lightweight web client and caching backend for browsing and playing YouTube videos without heavy bloatware, tracking scripts, or lag. Featuring an in-memory caching Express server and a vanilla JavaScript single-page application with persistent iframe playback.

---

## ✨ Features

- ⚡ **Ultra-Fast In-Memory Cache**:
  - Express backend caches trending feeds, search queries, and related video lists for 30 minutes.
  - Delivers sub-50ms API response times on repeated queries.
- 📺 **Persistent YouTube Player**:
  - Seamless video playback using the official YouTube IFrame Player API.
  - Keeps video playing while navigating between search results and related feeds.
- 🔍 **Instant Search & Trending Feeds**:
  - Real-time search query dispatch powered by `yt-search`.
  - Curated trending feed across music, gaming, and tech.
- 🎨 **Sleek YouTube-Themed Dark UI**:
  - Clean, distraction-free YouTube-inspired dark theme.
  - Fully responsive grid layout adapting effortlessly across mobile, tablet, and desktop displays.
- 🚀 **Zero Heavy Frameworks**:
  - Written in pure vanilla JavaScript, HTML5, and CSS3 for minimal client bundle size and rapid page loads.

---

## 📋 Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Moiz-Genius/youtube-clone.git
cd youtube-clone
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Server

```bash
npm start
```

### 4. Open in Browser

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🔌 API Endpoints

The Express server exposes fast JSON endpoints:

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/trending` | `GET` | Fetches the top trending videos (cached for 30 minutes). |
| `/api/search?q=:query` | `GET` | Searches YouTube with the provided query string. |
| `/api/related/:id` | `GET` | Fetches recommended related videos for a given video ID. |

---

## 📁 Project Structure

```text
youtube-clone/
├── server.js          # Express backend, in-memory caching, API routes, and static file server
├── app.js             # Client SPA logic, YouTube IFrame API integration, and DOM renderer
├── index.html         # Single-page application shell
├── styles.css         # Dark theme responsive stylesheet
├── package.json       # Project dependencies & scripts
└── package-lock.json  # Dependency lockfile
```

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
