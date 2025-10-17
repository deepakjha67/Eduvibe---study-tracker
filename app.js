// js/app.js
import * as Navigation from './modules/navigation.js';
import * as Dashboard from './modules/dashboard.js';
import * as Courses from './modules/courses.js';
import * as Goals from './modules/goals.js';
import * as Achievements from './modules/achievements.js';
import * as FocusMode from './modules/focus-mode.js';
import * as Settings from './modules/settings.js';
import * as Storage from './modules/storage.js';

// Global state
const AppState = {
    expandedPlaylistId: null,
    pomodoroTimer: null,
    pomodoroTimeLeft: 25 * 60,
    isPomodoroRunning: false,
    currentSessionTask: '',
    sessionStartTime: null
};

// Initialize the app
function init() {
    // Load data first
    Storage.loadAllData();
    
    // Initialize all modules
    Navigation.init(AppState);
    Dashboard.init(AppState);
    Courses.init(AppState);
    Goals.init(AppState);
    Achievements.init(AppState);
    FocusMode.init(AppState);
    Settings.init(AppState);
    
    // Setup floating button
    setupFloatingButton();
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function setupFloatingButton() {
    const floatingAddBtn = document.getElementById('floatingAddBtn');
    const addFormContainer = document.getElementById('addFormContainer');
    const goalTitleEl = document.getElementById('goalTitle');
    
    floatingAddBtn.addEventListener('click', () => {
        // Open the appropriate form based on current tab
        const activeTab = document.querySelector('.nav-tab.active, .mobile-nav-tab.active').dataset.tab;
        if (activeTab === 'courses') {
            addFormContainer.classList.add('active');
        } else if (activeTab === 'goals') {
            goalTitleEl.focus();
        }
    });
}

// Make AppState globally available for modules
window.AppState = AppState;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);