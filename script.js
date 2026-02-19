// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const playlistItems = document.getElementById('playlistItems');
const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const currentTrackEl = document.getElementById('currentTrack');

// State
let playlist = [];
let currentTrackIndex = -1;
let isPlaying = false;

// Initialize
function init() {
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Click to upload
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Audio player events
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('loadedmetadata', updateDuration);
    audioPlayer.addEventListener('ended', playNext);
    
    // Control buttons
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', playPrev);
    nextBtn.addEventListener('click', playNext);
    
    // Progress bar click
    progressBar.addEventListener('click', seekTo);
}

// Handle drag over
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

// Handle drag leave
function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

// Handle drop
function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    handleFiles(files);
}

// Handle file select
function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

// Handle files
function handleFiles(files) {
    for (let file of files) {
        if (file.type === 'audio/mp3' || file.type === 'audio/mpeg') {
            const track = {
                name: file.name.replace(/\.[^/.]+$/, ''),
                file: file,
                url: URL.createObjectURL(file)
            };
            playlist.push(track);
        }
    }
    
    if (playlist.length > 0) {
        renderPlaylist();
        
        // If no track is currently playing, start the first one
        if (currentTrackIndex === -1) {
            loadTrack(0);
        }
    }
}

// Render playlist
function renderPlaylist() {
    playlistItems.innerHTML = '';
    
    playlist.forEach((track, index) => {
        const li = document.createElement('li');
        li.className = 'playlist-item';
        if (index === currentTrackIndex) {
            li.classList.add('active');
        }
        
        li.innerHTML = `
            <span>🎵 ${track.name}</span>
            <button class="remove-btn" data-index="${index}">✕</button>
        `;
        
        li.addEventListener('click', (e) => {
            if (!e.target.classList.contains('remove-btn')) {
                loadTrack(index);
            }
        });
        
        li.querySelector('.remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            removeTrack(index);
        });
        
        playlistItems.appendChild(li);
    });
}

// Remove track
function removeTrack(index) {
    // Revoke object URL to free memory
    URL.revokeObjectURL(playlist[index].url);
    
    // Remove from playlist
    playlist.splice(index, 1);
    
    // If removed track was playing, load next track
    if (index === currentTrackIndex) {
        if (playlist.length > 0) {
            loadTrack(Math.min(index, playlist.length - 1));
        } else {
            currentTrackIndex = -1;
            audioPlayer.pause();
            audioPlayer.src = '';
            currentTrackEl.textContent = 'No track selected';
            playBtn.textContent = '▶';
            isPlaying = false;
        }
    } else if (index < currentTrackIndex) {
        currentTrackIndex--;
    }
    
    renderPlaylist();
}

// Load track
function loadTrack(index) {
    currentTrackIndex = index;
    const track = playlist[index];
    
    audioPlayer.src = track.url;
    currentTrackEl.textContent = track.name;
    
    renderPlaylist();
    playTrack();
}

// Play track
function playTrack() {
    audioPlayer.play();
    playBtn.textContent = '⏸';
    isPlaying = true;
}

// Pause track
function pauseTrack() {
    audioPlayer.pause();
    playBtn.textContent = '▶';
    isPlaying = false;
}

// Toggle play/pause
function togglePlay() {
    if (currentTrackIndex === -1) {
        if (playlist.length > 0) {
            loadTrack(0);
        }
        return;
    }
    
    if (isPlaying) {
        pauseTrack();
    } else {
        playTrack();
    }
}

// Play previous track
function playPrev() {
    if (currentTrackIndex > 0) {
        loadTrack(currentTrackIndex - 1);
    } else {
        loadTrack(playlist.length - 1);
    }
}

// Play next track
function playNext() {
    if (currentTrackIndex < playlist.length - 1) {
        loadTrack(currentTrackIndex + 1);
    } else {
        loadTrack(0);
    }
}

// Update progress
function updateProgress() {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressFill.style.width = `${progress}%`;
    
    currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
}

// Update duration
function updateDuration() {
    durationEl.textContent = formatTime(audioPlayer.duration);
}

// Seek to position
function seekTo(e) {
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioPlayer.currentTime = percent * audioPlayer.duration;
}

// Format time
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Initialize the app
init();