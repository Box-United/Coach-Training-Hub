// YouTube IFrame Player API wrapper with seek-blocking: scrubbing ahead of the
// furthest point actually watched snaps back. Good-faith only, not
// tamperproof, a coach editing the page or hitting the YouTube API directly
// can bypass it.

let ytPlayer = null;
let furthestSeconds = 0;
let onFurthestChange = null;
let seekCheckInterval = null;

function loadYouTubeAPI() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = resolve;
  });
}

async function initVideoPlayer(elementId, youtubeId, startFurthestSeconds, onProgress) {
  furthestSeconds = startFurthestSeconds || 0;
  onFurthestChange = onProgress;
  await loadYouTubeAPI();
  ytPlayer = new YT.Player(elementId, {
    videoId: youtubeId,
    playerVars: { rel: 0, modestbranding: 1 },
    events: { onStateChange: handlePlayerStateChange }
  });
}

function handlePlayerStateChange(event) {
  clearInterval(seekCheckInterval);
  if (event.data === YT.PlayerState.PLAYING) {
    seekCheckInterval = setInterval(checkForSeekAhead, 1000);
  }
}

function checkForSeekAhead() {
  if (!ytPlayer || typeof ytPlayer.getCurrentTime !== "function") return;
  const current = ytPlayer.getCurrentTime();
  const tolerance = 2;
  if (current > furthestSeconds + tolerance) {
    ytPlayer.seekTo(furthestSeconds, true);
    return;
  }
  if (current > furthestSeconds) {
    furthestSeconds = current;
    if (onFurthestChange) onFurthestChange(Math.floor(furthestSeconds));
  }
}
