// YouTube IFrame Player API wrapper with seek-blocking: scrubbing ahead of the
// furthest point actually watched snaps back. Good-faith only, not
// tamperproof, a coach editing the page or hitting the YouTube API directly
// can bypass it.
//
// A module can hold more than one video (see `videos` in js/modules-data.js),
// so this builds one independent player per video, each tracking its own
// furthest-watched position. State lives inside createVideoPlayer rather than
// in module scope, otherwise a second player would overwrite the first's
// position and let a coach skip straight through it.

function loadYouTubeAPI() {
  if (window.YT && window.YT.Player) return Promise.resolve();
  // Every player on the page asks for the API at once. Only the first should
  // inject the script tag, the rest wait on that same promise, because
  // onYouTubeIframeAPIReady only ever fires once.
  if (!window.__ytApiPromise) {
    window.__ytApiPromise = new Promise((resolve) => {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = resolve;
    });
  }
  return window.__ytApiPromise;
}

// Treat a video as watched slightly before its true end. The position is
// sampled once a second and YouTube's reported duration is fractional, so
// requiring an exact match would leave a fully watched video short.
const COMPLETE_TOLERANCE_SECONDS = 5;

function isVideoComplete(furthestSeconds, durationSeconds) {
  if (!durationSeconds) return false;
  return furthestSeconds >= durationSeconds - COMPLETE_TOLERANCE_SECONDS;
}

// onUpdate({ furthest, duration, complete }) fires whenever the furthest
// watched point moves, and once on load so the caller can render initial
// state without waiting for playback.
async function createVideoPlayer(elementId, youtubeId, startFurthestSeconds, onUpdate) {
  await loadYouTubeAPI();

  let furthestSeconds = startFurthestSeconds || 0;
  let durationSeconds = 0;
  let seekCheckInterval = null;
  let player = null;

  function emit() {
    if (!onUpdate) return;
    const furthest = Math.floor(furthestSeconds);
    onUpdate({
      furthest,
      duration: durationSeconds,
      complete: isVideoComplete(furthest, durationSeconds)
    });
  }

  function checkForSeekAhead() {
    if (!player || typeof player.getCurrentTime !== "function") return;
    const current = player.getCurrentTime();
    const tolerance = 2;
    if (current > furthestSeconds + tolerance) {
      player.seekTo(furthestSeconds, true);
      return;
    }
    if (current > furthestSeconds) {
      furthestSeconds = current;
      emit();
    }
  }

  function handleStateChange(event) {
    clearInterval(seekCheckInterval);
    if (event.data === YT.PlayerState.PLAYING) {
      seekCheckInterval = setInterval(checkForSeekAhead, 1000);
      return;
    }
    if (event.data === YT.PlayerState.ENDED) {
      // Sampling once a second leaves the tracked position a beat short of
      // the duration. Without this, watching a video all the way through
      // would still not count as finishing it.
      furthestSeconds = Math.max(furthestSeconds, durationSeconds);
      emit();
    }
  }

  player = new YT.Player(elementId, {
    videoId: youtubeId,
    playerVars: { rel: 0, modestbranding: 1 },
    events: {
      onReady: () => {
        durationSeconds = player.getDuration() || 0;
        emit();
      },
      onStateChange: handleStateChange
    }
  });

  return {
    getFurthest: () => Math.floor(furthestSeconds),
    getDuration: () => durationSeconds,
    isComplete: () => isVideoComplete(Math.floor(furthestSeconds), durationSeconds)
  };
}
