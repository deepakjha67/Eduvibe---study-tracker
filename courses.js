// js/modules/dashboard.js
import * as Storage from './storage.js';
import * as Helpers from '../utils/helpers.js';

let streakCountEl, headerStreakCountEl, totalPlaylistsEl, completedVideosEl, todayGoalsCompletedEl;
let todayGoalsEl, todayProgressEl, calendarDays, currentMonthEl, studyDetails;

export function init(AppState) {
    // Cache DOM elements
    streakCountEl = document.getElementById('streakCount');
    headerStreakCountEl = document.getElementById('headerStreakCount');
    totalPlaylistsEl = document.getElementById('totalPlaylists');
    completedVideosEl = document.getElementById('completedVideos');
    todayGoalsCompletedEl = document.getElementById('todayGoalsCompleted');
    todayGoalsEl = document.getElementById('todayGoals');
    todayProgressEl = document.getElementById('todayProgress');
    calendarDays = document.getElementById('calendarDays');
    currentMonthEl = document.getElementById('currentMonth');
    studyDetails = document.getElementById('studyDetails');

    // Initial render
    updateStats();
    updateStreak();
    generateCalendar();
    renderTodayGoals();
}

export function updateStats() {
    const AppData = Storage.getAppData();
    const totalPlaylists = AppData.playlists.length;
    const completedVideos = AppData.playlists.reduce((sum, playlist) => 
        sum + playlist.videos.filter(v => v.completed).length, 0);
    
    // Calculate today's goals completion
    const today = new Date().toDateString();
    const todayGoals = AppData.dailyGoals.filter(goal => goal.date === today);
    const completedTodayGoals = todayGoals.filter(goal => goal.completed).length;
    const totalTodayGoals = todayGoals.length;
    
    totalPlaylistsEl.textContent = totalPlaylists;
    completedVideosEl.textContent = completedVideos;
    todayGoalsCompletedEl.textContent = `${completedTodayGoals}/${totalTodayGoals}`;
    streakCountEl.textContent = AppData.streak;
    headerStreakCountEl.textContent = AppData.streak;
}

export function updateStreak(completedToday = false) {
    const AppData = Storage.getAppData();
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();
    
    // If we're completing something today
    if (completedToday) {
        // If last completion was yesterday, increment streak
        if (AppData.lastCompletedDate === yesterdayString) {
            AppData.streak++;
        } 
        // If last completion was today, keep streak the same
        else if (AppData.lastCompletedDate !== today) {
            // If last completion wasn't today or yesterday, reset to 1
            AppData.streak = 1;
        }
        AppData.lastCompletedDate = today;
    } else {
        // Check if streak should be reset (missed a day)
        if (AppData.lastCompletedDate && AppData.lastCompletedDate !== today && AppData.lastCompletedDate !== yesterdayString) {
            AppData.streak = 0;
        }
    }
    
    // Save to localStorage
    Storage.saveAllData();
    
    // Update UI
    streakCountEl.textContent = AppData.streak;
    headerStreakCountEl.textContent = AppData.streak;
}

export function renderTodayGoals() {
    const AppData = Storage.getAppData();
    const today = new Date().toDateString();
    const todayGoals = AppData.dailyGoals.filter(goal => goal.date === today);
    
    todayGoalsEl.innerHTML = '';
    
    if (todayGoals.length === 0) {
        todayGoalsEl.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 20px;">No goals set for today</p>';
        todayProgressEl.style.width = '0%';
        return;
    }
    
    const completedGoals = todayGoals.filter(goal => goal.completed).length;
    const progressPercentage = (completedGoals / todayGoals.length) * 100;
    
    todayProgressEl.style.width = `${progressPercentage}%`;
    
    todayGoals.forEach(goal => {
        const goalEl = document.createElement('div');
        goalEl.className = 'goal-item';
        goalEl.innerHTML = `
            <input type="checkbox" class="goal-checkbox" ${goal.completed ? 'checked' : ''} data-id="${goal.id}">
            <div class="goal-text">${goal.title}</div>
        `;
        todayGoalsEl.appendChild(goalEl);
        
        // Add event listener for checkbox
        const checkbox = goalEl.querySelector('.goal-checkbox');
        checkbox.addEventListener('change', (e) => {
            toggleGoalCompletion(goal.id, e.target.checked);
        });
    });
}

function toggleGoalCompletion(goalId, completed) {
    const AppData = Storage.getAppData();
    const goal = AppData.dailyGoals.find(g => g.id === goalId);
    if (goal) {
        goal.completed = completed;
        Storage.saveAllData();
        renderTodayGoals();
        
        // Update streak if this is the first completion today
        if (completed) {
            const today = new Date().toDateString();
            const todayGoals = AppData.dailyGoals.filter(g => g.date === today);
            const completedTodayGoals = todayGoals.filter(g => g.completed);
            
            // If this is the first completion today, update streak
            if (completedTodayGoals.length === 1) {
                updateStreak(true);
            }
        }
    }
}

export function generateCalendar() {
    const AppData = Storage.getAppData();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Set current month text
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    currentMonthEl.textContent = `${monthNames[month]} ${year}`;
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Clear calendar
    calendarDays.innerHTML = '';
    
    // Add day headers
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    dayNames.forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day-header';
        dayEl.textContent = day;
        calendarDays.appendChild(dayEl);
    });
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        const emptyEl = document.createElement('div');
        emptyEl.className = 'calendar-day';
        calendarDays.appendChild(emptyEl);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day;
        
        // Create date string for this day
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        dayEl.dataset.date = dateStr;
        
        // Mark today
        if (day === now.getDate() && month === now.getMonth() && year === now.getFullYear()) {
            dayEl.classList.add('active');
        }
        
        // Mark studied days
        if (AppData.studyHistory[dateStr] && AppData.studyHistory[dateStr].length > 0) {
            dayEl.classList.add('studied');
        }
        
        // Add click event to show study details
        dayEl.addEventListener('click', () => {
            showStudyDetails(dateStr);
        });
        
        calendarDays.appendChild(dayEl);
    }
}

function showStudyDetails(dateStr) {
    const AppData = Storage.getAppData();
    const studies = AppData.studyHistory[dateStr] || [];
    const goals = AppData.dailyGoals.filter(goal => goal.date === dateStr);
    const completedGoals = goals.filter(goal => goal.completed).length;
    const totalGoals = goals.length;
    const goalPercentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
    
    if (studies.length === 0 && goals.length === 0) {
        studyDetails.innerHTML = `
            <h4>Study Details - ${Helpers.formatDate(dateStr)}</h4>
            <p>No studies or goals recorded for this day</p>
        `;
    } else {
        studyDetails.innerHTML = `
            <h4>Study Details - ${Helpers.formatDate(dateStr)}</h4>
            ${studies.length > 0 ? `
                <h5 style="margin-top: 15px; color: var(--accent);">Completed Videos</h5>
                ${studies.map(study => `
                    <div class="study-item">
                        <strong>${study.playlist}</strong><br>
                        ${study.video}
                    </div>
                `).join('')}
            ` : ''}
            ${goals.length > 0 ? `
                <h5 style="margin-top: 15px; color: var(--accent);">Daily Goals</h5>
                <p>Completed ${completedGoals} of ${totalGoals} goals (${goalPercentage}%)</p>
                ${goals.map(goal => `
                    <div class="study-item">
                        <i class="fas ${goal.completed ? 'fa-check text-success' : 'fa-times text-warning'}"></i>
                        ${goal.title}
                    </div>
                `).join('')}
            ` : ''}
        `;
    }
}