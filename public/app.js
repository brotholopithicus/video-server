const player = document.querySelector('.player');
const video = player.querySelector('.viewer');
const progress = player.querySelector('.progress');
const progressBar = player.querySelector('.progress-filled');
const toggle = player.querySelector('.toggle');
const fullscreen = player.querySelector('.fullscreen');
const volume = player.querySelector('.volume-toggle');
const volumeRange = player.querySelector(`input[name='volume']`);

const skipButtons = player.querySelectorAll('button[data-skip]');
const ranges = player.querySelectorAll(`input[type='range']`);

const videoListItems = document.querySelectorAll('.list-item');

videoListItems.forEach(item => item.addEventListener('click', handleListClick));

// update video player source
function handleListClick(e) {
  // update source
  video.src = `/videos/video${this.dataset.video}.mp4`;
  video.currentTime = 0;
  video.play();

  // add active class to current video
  videoListItems.forEach(item => {
    if (item.classList.contains('active')) {
      item.classList.remove('active');
    }
  });
  this.classList.add('active');
}

// toggle video play state
function togglePlay() {
  video[video.paused ? 'play' : 'pause']();
}

// toggle fullscreen video player
function toggleFullscreen(e) {
  if (document.webkitFullscreenElement) {
    document.webkitExitFullscreen();
    fullscreen.textContent = '';
  } else {
    player.webkitRequestFullscreen();
    fullscreen.textContent = '✕';
  }
}

// update volume
function updateVolumeRange(level) {
  volumeRange.value = level;
}

// change volume icon based on level
// TODO
function toggleVolume() {
  if (this.dataset.level === 'full') {
    this.dataset.level = 'mute';
    this.innerHTML = '&#128263;';
    video.volume = 0;
  } else {
    this.dataset.level = 'full';
    this.innerHTML = '&#128266;';
    video.volume = 1;
  }
  updateVolumeRange(video.volume);
}

// update play / pause butotn based on video state
function updateButton() {
  toggle.textContent = this.paused ? '►' : '❚ ❚';
}

// skip forward / back
function skip() {
  video.currentTime += parseFloat(this.dataset.skip);
  console.log('skip');
}

// update volume and / or playback rate
function handleRangeUpdate() {
  video[this.name] = this.value;
}

// update ui progress bar based on current time and duration
function handleProgressUpdate() {
  const percent = (video.currentTime / video.duration) * 100;
  progressBar.style.flexBasis = `${percent}%`;
}

// change play position
function scrub(e) {
  video.currentTime = (e.offsetX / progress.offsetWidth) * video.duration;
}

video.addEventListener('click', togglePlay);
video.addEventListener('play', updateButton);
video.addEventListener('pause', updateButton);
video.addEventListener('timeupdate', handleProgressUpdate);

toggle.addEventListener('click', togglePlay);
fullscreen.addEventListener('click', toggleFullscreen);
volume.addEventListener('click', toggleVolume);

skipButtons.forEach(button => button.addEventListener('click', skip));
ranges.forEach(range => range.addEventListener('change', handleRangeUpdate));
ranges.forEach(range => range.addEventListener('mousemove', handleRangeUpdate));

let mousedown = false;
progress.addEventListener('click', scrub);
progress.addEventListener('mousemove', (e) => mousedown && scrub(e));
progress.addEventListener('mousedown', () => mousedown = true);
progress.addEventListener('mouseup', () => mousedown = false);
