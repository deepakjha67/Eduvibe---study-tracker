// js/modules/courses.js
import * as Storage from './storage.js';
import * as Helpers from '../utils/helpers.js';
import * as Dashboard from './dashboard.js';
import * as Achievements from './achievements.js';

let playlistForm, playlistsContainer, inProgressContainer, completedContainer;
let createFirstPlaylist, createPlaylistBtn, progressContainer;
let tabs, tabContents, tabsContainer;
let addFormContainer, closeAddForm, cancelAddForm;

export function init(AppState) {
    // Cache DOM elements
    playlistForm = document.getElementById('playlistForm');
    playlistsContainer = document.getElementById('playlistsContainer');
    inProgressContainer = document.getElementById('inProgressContainer');
    completedContainer = document.getElementById('completedContainer');
    createFirstPlaylist = document.getElementById('createFirstPlaylist');
    createPlaylistBtn = document.getElementById('createPlaylistBtn');
    progressContainer = document.getElementById('progressContainer');
    tabs = document.querySelectorAll('.tab');
    tabContents = document.querySelectorAll('.tab-content');
    tabsContainer = document.getElementById('tabsContainer');
    addFormContainer = document.getElementById('addFormContainer');
    closeAddForm = document.getElementById('closeAddForm');
    cancelAddForm = document.getElementById('cancelAddForm');

    setupEventListeners();
    renderPlaylists();
    renderProgressBars();
}

function setupEventListeners() {
    playlistForm.addEventListener('submit', handlePlaylistSubmit);
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
    
    createPlaylistBtn.addEventListener('click', () => {
        addFormContainer.classList.add('active');
    });
    
    createFirstPlaylist.addEventListener('click', () => {
        addFormContainer.classList.add('active');
    });
    
    closeAddForm.addEventListener('click', () => {
        addFormContainer.classList.remove('active');
    });
    
    cancelAddForm.addEventListener('click', () => {
        addFormContainer.classList.remove('active');
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === addFormContainer) {
            addFormContainer.classList.remove('active');
        }
    });
}

function handlePlaylistSubmit(e) {
    e.preventDefault();
    
    const playlistName = document.getElementById('playlistName').value;
    const playlistSource = document.getElementById('playlistSource').value;
    const playlistUrl = document.getElementById('playlistUrl').value;
    const videosData = document.getElementById('videosData').value;
    
    // Create videos array from textarea
    const videoTitles = videosData.split('\n')
        .map(title => title.trim())
        .filter(title => title.length > 0);
    
    const videos = videoTitles.map((title, index) => ({
        id: Date.now() + index,
        title: title,
        completed: false,
        locked: index > 0, // Lock all videos except the first one
        url: playlistUrl ? `${playlistUrl}&index=${index+1}` : ''
    }));
    
    // Create new playlist
    const newPlaylist = {
        id: Date.now(),
        name: playlistName,
        source: playlistSource,
        url: playlistUrl,
        videos: videos,
        createdAt: new Date().toISOString(),
        progress: 0
    };
    
    // Add to playlists array
    const AppData = Storage.getAppData();
    AppData.playlists.push(newPlaylist);
    
    // Save to localStorage
    Storage.saveAllData();
    
    // Update UI
    Dashboard.updateStats();
    renderPlaylists();
    renderProgressBars();
    
    // Reset form and close modal
    playlistForm.reset();
    addFormContainer.classList.remove('active');
    
    // Check for first playlist achievement
    Achievements.checkPlaylistAchievements();
}

export function renderPlaylists() {
    const AppData = Storage.getAppData();
    
    // Clear containers
    playlistsContainer.innerHTML = '';
    inProgressContainer.innerHTML = '';
    completedContainer.innerHTML = '';
    
    if (AppData.playlists.length === 0) {
        createFirstPlaylist.style.display = 'block';
        return;
    }
    
    createFirstPlaylist.style.display = 'none';
    
    AppData.playlists.forEach(playlist => {
        const playlistEl = createPlaylistElement(playlist);
        playlistsContainer.appendChild(playlistEl);
        
        // Add to appropriate tab container
        if (playlist.progress === 100) {
            const completedEl = createPlaylistElement(playlist);
            completedContainer.appendChild(completedEl);
        } else {
            const inProgressEl = createPlaylistElement(playlist);
            inProgressContainer.appendChild(inProgressEl);
        }
    });
}

function createPlaylistElement(playlist) {
    const AppState = window.AppState;
    const playlistEl = document.createElement('div');
    playlistEl.className = 'playlist-item';
    playlistEl.dataset.id = playlist.id;
    
    // Calculate progress
    const totalVideos = playlist.videos.length;
    const completedVideos = playlist.videos.filter(v => v.completed).length;
    const progress = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
    
    // Check if this playlist is expanded
    const isExpanded = AppState.expandedPlaylistId === playlist.id;
    
    playlistEl.innerHTML = `
        <div class="playlist-header">
            <div class="playlist-title">
                <i class="fas fa-chevron-down expand-icon"></i>
                ${playlist.name}
            </div>
            <div class="playlist-actions">
                ${playlist.url ? `<a href="${playlist.url}" target="_blank" class="open-resource-btn"><i class="fas fa-external-link-alt"></i> Open</a>` : ''}
            </div>
        </div>
        <div class="playlist-stats">
            <span><i class="fas fa-play-circle"></i> ${completedVideos}/${totalVideos}</span>
            <span><i class="fas fa-${Helpers.getSourceIcon(playlist.source)}"></i> ${playlist.source}</span>
        </div>
        <div class="progress-bar">
            <div class="progress" style="width: ${progress}%"></div>
        </div>
        <div class="playlist-details ${isExpanded ? 'expanded' : ''}">
            <div class="video-list">
                ${playlist.videos.map(video => `
                    <div class="video-item ${video.locked ? 'locked' : ''}" data-url="${video.url || ''}">
                        <input type="checkbox" class="video-checkbox" 
                            ${video.completed ? 'checked' : ''} 
                            ${video.locked ? 'disabled' : ''}
                            data-playlist="${playlist.id}" 
                            data-video="${video.id}">
                        <div class="video-title">${video.title}</div>
                        <div class="video-status ${Helpers.getStatusClass(video)}">${Helpers.getStatusText(video)}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Attach event listeners
    attachEventListeners(playlistEl, playlist.id);
    
    return playlistEl;
}

function attachEventListeners(playlistEl, playlistId) {
    const AppState = window.AppState;
    
    // Expand/collapse functionality
    const header = playlistEl.querySelector('.playlist-header');
    const details = playlistEl.querySelector('.playlist-details');
    const expandIcon = playlistEl.querySelector('.expand-icon');
    
    header.addEventListener('click', (e) => {
        // Don't trigger if external link was clicked
        if (!e.target.closest('.open-resource-btn')) {
            if (details.classList.contains('expanded')) {
                details.classList.remove('expanded');
                expandIcon.style.transform = 'rotate(0deg)';
                AppState.expandedPlaylistId = null;
            } else {
                // Close any other expanded playlists
                document.querySelectorAll('.playlist-details.expanded').forEach(el => {
                    el.classList.remove('expanded');
                    const icon = el.parentElement.querySelector('.expand-icon');
                    if (icon) icon.style.transform = 'rotate(0deg)';
                });
                
                details.classList.add('expanded');
                expandIcon.style.transform = 'rotate(180deg)';
                AppState.expandedPlaylistId = playlistId;
            }
        }
    });
    
    // Video completion checkboxes
    const checkboxes = playlistEl.querySelectorAll('.video-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleVideoCompletion);
    });
    
    // Video click to open URL
    const videoItems = playlistEl.querySelectorAll('.video-item');
    videoItems.forEach(videoItem => {
        videoItem.addEventListener('click', (e) => {
            // Don't trigger if checkbox was clicked
            if (!e.target.classList.contains('video-checkbox') && !videoItem.classList.contains('locked')) {
                const url = videoItem.dataset.url;
                if (url) {
                    window.open(url, '_blank');
                }
            }
        });
    });
}

function handleVideoCompletion(e) {
    const AppData = Storage.getAppData();
    const AppState = window.AppState;
    
    const playlistId = parseInt(e.target.dataset.playlist);
    const videoId = parseInt(e.target.dataset.video);
    const checked = e.target.checked;
    
    // Find the playlist and video
    const playlist = AppData.playlists.find(p => p.id === playlistId);
    const video = playlist.videos.find(v => v.id === videoId);
    
    if (video) {
        video.completed = checked;
        
        // If this video is completed, unlock the next one
        if (checked) {
            const videoIndex = playlist.videos.findIndex(v => v.id === videoId);
            if (videoIndex < playlist.videos.length - 1) {
                playlist.videos[videoIndex + 1].locked = false;
            }
            
            // Update streak
            Dashboard.updateStreak(true);
            
            // Add to study history with exact topic details
            const today = new Date().toISOString().split('T')[0];
            if (!AppData.studyHistory[today]) {
                AppData.studyHistory[today] = [];
            }
            
            // Add study record with exact topic
            AppData.studyHistory[today].push({
                playlist: playlist.name,
                video: video.title,
                completedAt: new Date().toISOString()
            });
            
            Storage.saveAllData();
        } else {
            // Remove from study history when unchecked
            const today = new Date().toISOString().split('T')[0];
            if (AppData.studyHistory[today]) {
                // Find and remove the study record for this video
                AppData.studyHistory[today] = AppData.studyHistory[today].filter(
                    record => !(record.playlist === playlist.name && record.video === video.title)
                );
                
                // If no studies left for today, remove the day entirely
                if (AppData.studyHistory[today].length === 0) {
                    delete AppData.studyHistory[today];
                }
                
                Storage.saveAllData();
            }
        }
        
        // Update playlist progress
        const completedVideos = playlist.videos.filter(v => v.completed).length;
        playlist.progress = Math.round((completedVideos / playlist.videos.length) * 100);
        
        // Save and update UI
        Storage.saveAllData();
        Dashboard.updateStats();
        renderPlaylists();
        renderProgressBars();
        Dashboard.generateCalendar(); // Update calendar when completion status changes
        
        // Check for completion achievements
        Achievements.checkPlaylistAchievements();
    }
}

export function renderProgressBars() {
    const AppData = Storage.getAppData();
    
    progressContainer.innerHTML = '';
    
    if (AppData.playlists.length === 0) {
        progressContainer.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 20px;">Create your first playlist to track your learning progress</p>';
        return;
    }
    
    AppData.playlists.forEach(playlist => {
        const totalVideos = playlist.videos.length;
        const completedVideos = playlist.videos.filter(v => v.completed).length;
        const progress = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
        
        const progressItem = document.createElement('div');
        progressItem.className = 'progress-item';
        progressItem.innerHTML = `
            <div class="progress-label">
                <span class="progress-name">${playlist.name}</span>
                <span class="progress-percentage">${progress}%</span>
            </div>
            <div class="horizontal-progress">
                <div class="horizontal-progress-bar" style="width: ${progress}%"></div>
            </div>
        `;
        
        progressContainer.appendChild(progressItem);
    });
}

function switchTab(tabName) {
    // Update active tab
    tabs.forEach(tab => {
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Update active tab content
    tabContents.forEach(content => {
        if (content.id === `${tabName}-tab`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
    
    // Update tabs container data attribute for CSS animation
    tabsContainer.setAttribute('data-active-tab', tabName);
}