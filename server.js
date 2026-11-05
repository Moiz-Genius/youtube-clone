const express = require('express');
const cors = require('cors');
const path = require('path');
const ytSearch = require('yt-search');

const app = express();
app.use(cors());

// Serve static files from current directory
app.use(express.static(__dirname));

// Simple in-memory cache for ultra-fast responses
const cache = new Map();
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

async function getCached(key, fetcher) {
  if (cache.has(key)) {
    const { data, timestamp } = cache.get(key);
    if (Date.now() - timestamp < CACHE_DURATION) return data;
  }
  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}

// Trending
app.get('/api/trending', async (req, res) => {
  try {
    const data = await getCached('trending', async () => {
      const results = await ytSearch('latest trending music gaming tech videos');
      return results.videos.slice(0, 8); // Reduced to 8 for max speed
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Query is required' });
  try {
    const data = await getCached(`search:${query.toLowerCase()}`, async () => {
      const results = await ytSearch(query);
      return results.videos.slice(0, 8); // Reduced to 8 for max speed
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Watch Details (Related Videos only, since frontend handles everything else instantly)
app.get('/api/related/:id', async (req, res) => {
  const videoId = req.params.id;
  if (!videoId) return res.status(400).json({ error: 'Video ID is required' });
  try {
    const data = await getCached(`related:${videoId}`, async () => {
      // Fetch metadata just to get the title to find related videos
      const video = await ytSearch({ videoId: videoId });
      const related = await ytSearch(video.title || 'recommended');
      return related.videos.filter(v => v.videoId !== videoId).slice(0, 4); // Reduced to 4 for max speed
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handle SPA routing - send all other requests to index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`SpeedTube Backend running at http://localhost:${PORT}`);
});
