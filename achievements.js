// js/modules/goals.js
import * as Storage from './storage.js';
import * as Dashboard from './dashboard.js';

let goalTitleEl, goalCategoryEl, addGoalBtn, goalsList, goalsProgressEl;
let timelineRangeEl, timelineChartEl;

export function init(AppState) {
    // Cache DOM elements
    goalTitleEl = document.getElementById('goalTitle');
    goalCategoryEl = document.getElementById('goalCategory');
    addGoalBtn = document.getElementById('addGoal');
    goalsList = document.getElementById('goalsList');
    goalsProgressEl = document.getElementById('goalsProgress');
    timelineRangeEl = document.getElementById('timelineRange');
    timelineChartEl = document.getElementById('timelineChart');

    setupEventListeners();
    renderGoals();
    renderTimeline();
}

function setupEventListeners() {
    addGoalBtn.addEventListener('click', addGoal);
    timelineRangeEl.addEventListener('change', renderTimeline);
}

export function addGoal() {
    const title = goalTitleEl.value.trim();
    const category = goalCategoryEl.value;
    
    if (!title) {
        alert('Please enter a goal title.');
        return;
    }
    
    const today = new Date().toDateString();
    const AppData = Storage.getAppData();
    
    const goal = {
        id: Date.now(),
        title,
        category,
        completed: false,
        date: today,
        createdAt: new Date().toISOString()
    };
    
    AppData.dailyGoals.push(goal);
    Storage.saveAllData();
    
    // Clear form
    goalTitleEl.value = '';
    
    // Update UI
    Dashboard.renderTodayGoals();
    renderGoals();
    
    // Show success message
    alert('Goal added successfully!');
}

export function renderGoals() {
    const AppData = Storage.getAppData();
    const today = new Date().toDateString();
    const todayGoals = AppData.dailyGoals.filter(goal => goal.date === today);
    
    goalsList.innerHTML = '';
    
    if (todayGoals.length === 0) {
        goalsList.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 20px;">No goals set for today. Add your first goal above!</p>';
        goalsProgressEl.style.width = '0%';
        return;
    }
    
    const completedGoals = todayGoals.filter(goal => goal.completed).length;
    const progressPercentage = (completedGoals / todayGoals.length) * 100;
    
    goalsProgressEl.style.width = `${progressPercentage}%`;
    
    todayGoals.forEach(goal => {
        const goalEl = document.createElement('div');
        goalEl.className = 'goal-item';
        goalEl.innerHTML = `
            <input type="checkbox" class="goal-checkbox" ${goal.completed ? 'checked' : ''} data-id="${goal.id}">
            <div class="goal-text">${goal.title}</div>
            <span class="goal-category">${goal.category}</span>
        `;
        goalsList.appendChild(goalEl);
        
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
        Dashboard.renderTodayGoals();
        renderGoals();
        
        // Update streak if this is the first completion today
        if (completed) {
            const today = new Date().toDateString();
            const todayGoals = AppData.dailyGoals.filter(g => g.date === today);
            const completedTodayGoals = todayGoals.filter(g => g.completed);
            
            // If this is the first completion today, update streak
            if (completedTodayGoals.length === 1) {
                Dashboard.updateStreak(true);
            }
        }
    }
}

export function renderTimeline() {
    const AppData = Storage.getAppData();
    const range = timelineRangeEl.value;
    const today = new Date();
    const data = [];
    
    if (range === 'month') {
        // Show monthly data
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        // Get data for current month
        const monthStart = new Date(currentYear, currentMonth, 1);
        const monthEnd = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = monthEnd.getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dateStr = date.toISOString().split('T')[0];
            
            // Count completed goals for this date
            const goals = AppData.dailyGoals.filter(goal => goal.date === dateStr);
            const completed = goals.filter(goal => goal.completed).length;
            const total = goals.length;
            const percentage = total > 0 ? (completed / total) * 100 : 0;
            
            data.push({
                date: dateStr,
                percentage: percentage,
                label: day.toString()
            });
        }
        
        // Update header to show month name
        document.querySelector('.timeline-header h3').textContent = 
            `Daily Goal Completion - ${monthNames[currentMonth]} ${currentYear}`;
    } else {
        // Show daily data for selected range
        const days = parseInt(range);
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            // Count completed goals for this date
            const goals = AppData.dailyGoals.filter(goal => goal.date === dateStr);
            const completed = goals.filter(goal => goal.completed).length;
            const total = goals.length;
            const percentage = total > 0 ? (completed / total) * 100 : 0;
            
            data.push({
                date: dateStr,
                percentage: percentage,
                label: (date.getDate() + '/' + (date.getMonth() + 1))
            });
        }
        
        // Update header
        document.querySelector('.timeline-header h3').textContent = 'Daily Goal Completion';
    }
    
    timelineChartEl.innerHTML = '';
    
    data.forEach(item => {
        const bar = document.createElement('div');
        bar.className = 'timeline-bar';
        bar.style.height = `${Math.max(item.percentage, 5)}%`; // Minimum 5% height for visibility
        bar.title = `${item.date}: ${Math.round(item.percentage)}%`;
        
        const label = document.createElement('div');
        label.className = 'timeline-label';
        label.textContent = item.label;
        
        bar.appendChild(label);
        timelineChartEl.appendChild(bar);
    });
}