const player = document.querySelector('.player');
const video = player.querySelector('.viewer');
const progress = player.querySelector('.progress');
const progressBar = player.querySelector('.progress-filled');
const toggle = player.querySelector('.toggle');
const fullscreen = player.querySelector('.fullscreen');

const skipButtons = player.querySelectorAll('button[data-skip]');
const ranges = player.querySelectorAll(`input[type='range']`);

function togglePlay() {
    video[video.paused ? 'play' : 'pause']();
}

function toggleFullscreen(e) {
    if (document.webkitFullscreenElement) {
        document.webkitExitFullscreen();
    } else {
        player.webkitRequestFullscreen();
    }
}

function updateButton() {
    toggle.textContent = this.paused ? '►' : '❚ ❚';
}

function skip() {
    video.currentTime += parseFloat(this.dataset.skip);
    console.log('skip');
}

function handleRangeUpdate() {
    video[this.name] = this.value;
}

function handleProgressUpdate() {
    const percent = (video.currentTime / video.duration) * 100;
    progressBar.style.flexBasis = `${percent}%`;
}

function scrub(e) {
    video.currentTime = (e.offsetX / progress.offsetWidth) * video.duration;
}

video.addEventListener('click', togglePlay);
video.addEventListener('play', updateButton);
video.addEventListener('pause', updateButton);
video.addEventListener('timeupdate', handleProgressUpdate);

toggle.addEventListener('click', togglePlay);
fullscreen.addEventListener('click', toggleFullscreen);

skipButtons.forEach(button => button.addEventListener('click', skip));
ranges.forEach(range => range.addEventListener('change', handleRangeUpdate));
ranges.forEach(range => range.addEventListener('mousemove', handleRangeUpdate));

let mousedown = false;
progress.addEventListener('click', scrub);
progress.addEventListener('mousemove', (e) => mousedown && scrub(e));
progress.addEventListener('mousedown', () => mousedown = true);
progress.addEventListener('mouseup', () => mousedown = false);
