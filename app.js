/* ============================================
   SpeedTube — Application Logic (ULTRA-INSTANT SPA)
   ============================================ */

const state = {
  currentView: 'home',
  searchQuery: '',
  videoCache: new Map(),
};

const $ = (sel) => document.querySelector(sel);

// ── Persistent Player Setup ──
let ytPlayer;
let isPlayerReady = false;

// Called automatically by YouTube iframe API script when it loads
window.onYouTubeIframeAPIReady = function() {
  ytPlayer = new YT.Player('yt-player', {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
      iv_load_policy: 3,
      fs: 1,
      color: 'white'
    },
    events: {
      'onReady': () => { isPlayerReady = true; }
    }
  });
};

// ── API Layer ──
async function tryFetch(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return await resp.json();
}
async function getTrending() { return await tryFetch('/api/trending'); }
async function searchVideos(query) { return await tryFetch(`/api/search?q=${encodeURIComponent(query)}`); }
async function getRelated(videoId) { return await tryFetch(`/api/related/${videoId}`); }

// ── Utilities ──
function formatViews(count) {
  if (!count) return '';
  if (count >= 1_000_000_000) return (count / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B views';
  if (count >= 1_000_000) return (count / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M views';
  if (count >= 1_000) return (count / 1_000).toFixed(1).replace(/\.0$/, '') + 'K views';
  return count.toLocaleString() + ' views';
}

function formatDuration(seconds) {
  if (!seconds) return '';
  const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60), s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getThumbnail(video) {
  return video.thumbnail || (video.videoId ? `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg` : '');
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ── Rendering ──
function renderVideoCard(video) {
  state.videoCache.set(video.videoId, video);
  const authorName = typeof video.author === 'string' ? video.author : (video.author?.name || '');
  const lengthSeconds = video.duration?.seconds || video.seconds || 0;
  
  return `
    <div class="video-card" onclick="navigateInstant('watch', '${video.videoId}')">
      <div class="thumbnail-container">
        <img src="${getThumbnail(video)}" loading="lazy">
        <div class="thumbnail-overlay"></div>
        ${lengthSeconds ? `<span class="duration-badge">${formatDuration(lengthSeconds)}</span>` : ''}
      </div>
      <div class="video-info">
        <div class="channel-avatar">${authorName.charAt(0).toUpperCase() || '?'}</div>
        <div class="video-meta">
          <div class="video-title">${escapeHtml(video.title)}</div>
          <div class="video-channel">${escapeHtml(authorName)}</div>
          <div class="video-stats">
            <span>${formatViews(video.views)}</span>
            <span>${video.ago || ''}</span>
          </div>
        </div>
      </div>
    </div>`;
}

function renderVideoGrid(videos) {
  if (!videos || !videos.length) return `<div class="error-state"><h2>No videos found</h2></div>`;
  return `<div class="video-grid">${videos.map(v => v.videoId ? renderVideoCard(v) : '').join('')}</div>`;
}

function renderRelatedCard(video) {
  state.videoCache.set(video.videoId, video);
  const authorName = typeof video.author === 'string' ? video.author : (video.author?.name || '');
  return `
    <div class="related-card" onclick="navigateInstant('watch', '${video.videoId}')">
      <div class="related-thumb">
        <img src="${getThumbnail(video)}" loading="lazy">
      </div>
      <div class="related-meta">
        <div class="video-title">${escapeHtml(video.title)}</div>
        <div class="video-channel">${escapeHtml(authorName)}</div>
      </div>
    </div>`;
}

function renderWatchInfo(metadata) {
  const title = metadata.title || '';
  const author = typeof metadata.author === 'string' ? metadata.author : (metadata.author?.name || 'Unknown');
  const views = metadata.views ? formatViews(metadata.views) + ' views' : '';
  const desc = metadata.description || '';

  return `
    <div class="watch-info">
      <h1 class="watch-title">${escapeHtml(title)}</h1>
      <div class="watch-actions">
        <div class="watch-channel">
          <div class="watch-channel-avatar">${author.charAt(0).toUpperCase()}</div>
          <div class="watch-channel-info"><h3>${escapeHtml(author)}</h3></div>
        </div>
      </div>
      ${desc ? `
      <div class="description-box" onclick="this.classList.toggle('expanded')">
        <div class="description-stats">${views}</div>
        <div class="description-text">${escapeHtml(desc)}</div>
      </div>` : ''}
    </div>`;
}

// ── Navigation ──
function navigateInstant(view, data) {
  const contentArea = $('#content-area');
  const playerWrapper = $('#persistent-player-wrapper');
  state.currentView = view;

  // Handle Player State
  if (view === 'watch') {
    // Show player
    playerWrapper.style.display = 'block';
    
    // Load video instantly via API
    if (isPlayerReady && ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
      ytPlayer.loadVideoById(data);
    } else {
      // Fallback if API is slow to load
      setTimeout(() => { if(isPlayerReady) ytPlayer.loadVideoById(data); }, 500);
    }
  } else {
    // Hide player and stop video
    playerWrapper.style.display = 'none';
    if (isPlayerReady && ytPlayer && typeof ytPlayer.stopVideo === 'function') {
      ytPlayer.stopVideo();
    }
  }

  // Handle UI changes
  if (view === 'home') {
    window.history.pushState({}, '', '/');
    loadHome();
  } else if (view === 'search') {
    window.history.pushState({}, '', `?search=${encodeURIComponent(data)}`);
    loadSearch(data);
  } else if (view === 'watch') {
    window.history.pushState({}, '', `?watch=${data}`);
    const cachedData = state.videoCache.get(data) || {};
    
    // Inject the info section immediately
    contentArea.innerHTML = `
      <div class="watch-page">
        <!-- Player placeholder to maintain layout -->
        <div class="video-player-wrapper">
          <div style="width:100%; padding-top:56.25%;"></div>
          <div id="watch-info-container">${renderWatchInfo(cachedData)}</div>
        </div>
        <div class="related-videos" id="related-container"></div>
      </div>
    `;
    
    // Position the real player exactly over the placeholder
    const placeholder = contentArea.querySelector('.video-player-wrapper > div');
    const rect = placeholder.getBoundingClientRect();
    playerWrapper.style.position = 'absolute';
    playerWrapper.style.top = (window.scrollY + rect.top) + 'px';
    playerWrapper.style.left = rect.left + 'px';
    playerWrapper.style.width = rect.width + 'px';
    playerWrapper.style.height = rect.height + 'px';

    window.scrollTo(0, 0);

    // Fetch related asynchronously
    getRelated(data).then(related => {
      const container = $('#related-container');
      if (container) container.innerHTML = `<div class="related-header">Related</div>` + related.map(v => renderRelatedCard(v)).join('');
    });
  }
}

// ── Resize Observer for Player ──
// Keep the absolute positioned player aligned if window resizes
window.addEventListener('resize', () => {
  if (state.currentView === 'watch') {
    const placeholder = $('#content-area').querySelector('.video-player-wrapper > div');
    const playerWrapper = $('#persistent-player-wrapper');
    if (placeholder && playerWrapper && playerWrapper.style.display !== 'none') {
      const rect = placeholder.getBoundingClientRect();
      playerWrapper.style.top = (window.scrollY + rect.top) + 'px';
      playerWrapper.style.left = rect.left + 'px';
      playerWrapper.style.width = rect.width + 'px';
      playerWrapper.style.height = rect.height + 'px';
    }
  }
});

// ── Loaders ──
async function loadHome() {
  $('#content-area').innerHTML = `<div class="loading-spinner">LOADING...</div>`;
  try {
    const videos = await getTrending();
    $('#content-area').innerHTML = renderVideoGrid(videos);
  } catch (e) {
    $('#content-area').innerHTML = `<div class="error-state"><h2>Server Error</h2><button class="retry-btn" onclick="loadHome()">Retry</button></div>`;
  }
}

async function loadSearch(query) {
  $('#content-area').innerHTML = `<div class="loading-spinner">SEARCHING...</div>`;
  try {
    const results = await searchVideos(query);
    $('#content-area').innerHTML = `<div class="results-header">Search: <strong>${escapeHtml(query)}</strong></div>` + renderVideoGrid(results);
  } catch (e) {
    $('#content-area').innerHTML = `<div class="error-state"><h2>Search failed</h2><button class="retry-btn" onclick="navigateInstant('search', '${query}')">Try Again</button></div>`;
  }
}

// ── Interactivity ──
function handleSearch(e) {
  e.preventDefault();
  const query = $('#search-input').value.trim();
  if (query) navigateInstant('search', query);
}

function handleRoute() {
  const params = new URLSearchParams(window.location.search);
  if (params.has('watch')) navigateInstant('watch', params.get('watch'));
  else if (params.has('search')) {
    $('#search-input').value = params.get('search');
    navigateInstant('search', params.get('search'));
  } else navigateInstant('home');
}

document.addEventListener('DOMContentLoaded', () => {
  $('#search-form')?.addEventListener('submit', handleSearch);
  $('#logo')?.addEventListener('click', () => navigateInstant('home'));
  window.addEventListener('popstate', handleRoute);
  handleRoute();
});
