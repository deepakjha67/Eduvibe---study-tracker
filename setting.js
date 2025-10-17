// js/modules/focus-mode.js
import * as Storage from './storage.js';
import * as Achievements from './achievements.js';

let pomodoroTimerEl, startTimerBtn, pauseTimerBtn, resetTimerBtn;
let sessionTaskEl, sessionDurationEl, currentTaskEl, focusHistoryList;

export function init(AppState) {
    // Cache DOM elements
    pomodoroTimerEl = document.getElementById('pomodoroTimer');
    startTimerBtn = document.getElementById('startTimer');
    pauseTimerBtn = document.getElementById('pauseTimer');
    resetTimerBtn = document.getElementById('resetTimer');
    sessionTaskEl = document.getElementById('sessionTask');
    sessionDurationEl = document.getElementById('sessionDuration');
    currentTaskEl = document.getElementById('currentTask');
    focusHistoryList = document.getElementById('focusHistoryList');

    setupEventListeners();
    renderFocusHistory();
    updateTimerDisplay();
}

function setupEventListeners() {
    startTimerBtn.addEventListener('click', startTimer);
    pauseTimerBtn.addEventListener('click', pauseTimer);
    resetTimerBtn.addEventListener('click', resetTimer);
    sessionTaskEl.addEventListener('input', updateCurrentTask);
}

export function startTimer() {
    const AppState = window.AppState;
    if (!AppState.isPomodoroRunning) {
        AppState.isPomodoroRunning = true;
        AppState.sessionStartTime = new Date();
        AppState.pomodoroTimer = setInterval(updateTimer, 1000);
    }
}

export function pauseTimer() {
    const AppState = window.AppState;
    AppState.isPomodoroRunning = false;
    clearInterval(AppState.pomodoroTimer);
}

export function resetTimer() {
    const AppState = window.AppState;
    pauseTimer();
    const duration = parseInt(sessionDurationEl.value) || 25;
    AppState.pomodoroTimeLeft = duration * 60;
    updateTimerDisplay();
}

function updateTimer() {
    const AppState = window.AppState;
    AppState.pomodoroTimeLeft--;
    
    if (AppState.pomodoroTimeLeft <= 0) {
        pauseTimer();
        // Timer completed - record the session
        recordFocusSession();
        
        // Show notification
        if (Notification.permission === 'granted') {
            new Notification('Study Session Complete!', {
                body: 'Time for a break!',
                icon: '/icon.png'
            });
        }
        alert('Session complete! Time for a break.');
    }
    
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const AppState = window.AppState;
    const minutes = Math.floor(AppState.pomodoroTimeLeft / 60);
    const seconds = AppState.pomodoroTimeLeft % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    pomodoroTimerEl.textContent = timeString;
}

function updateCurrentTask() {
    const AppState = window.AppState;
    AppState.currentSessionTask = sessionTaskEl.value;
    currentTaskEl.textContent = AppState.currentSessionTask || 'No active task';
}

function recordFocusSession() {
    const AppState = window.AppState;
    const AppData = Storage.getAppData();
    
    if (!AppState.sessionStartTime) return;
    
    const sessionEndTime = new Date();
    const duration = (sessionEndTime - AppState.sessionStartTime) / (1000 * 60 * 60); // Convert to hours
    
    const session = {
        id: Date.now(),
        task: AppState.currentSessionTask || 'Untitled Session',
        startTime: AppState.sessionStartTime.toISOString(),
        endTime: sessionEndTime.toISOString(),
        duration: duration,
        date: AppState.sessionStartTime.toISOString().split('T')[0]
    };
    
    AppData.focusHistory.unshift(session);
    AppData.totalFocusTime += duration;
    
    // Save to localStorage
    Storage.saveAllData();
    
    // Update UI
    renderFocusHistory();
    Achievements.checkFocusAchievements();
    
    // Reset session
    AppState.sessionStartTime = null;
}

export function renderFocusHistory() {
    const AppData = Storage.getAppData();
    focusHistoryList.innerHTML = '';
    
    if (AppData.focusHistory.length === 0) {
        focusHistoryList.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 20px;">Your focus sessions will appear here</p>';
        return;
    }
    
    // Show only last 10 sessions
    const recentSessions = AppData.focusHistory.slice(0, 10);
    
    recentSessions.forEach(session => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-info">
                <div class="history-task">${session.task}</div>
                <div class="history-date">${new Date(session.startTime).toLocaleDateString()}</div>
            </div>
            <div class="history-duration">${session.duration.toFixed(2)}h</div>
        `;
        focusHistoryList.appendChild(historyItem);
    });
}