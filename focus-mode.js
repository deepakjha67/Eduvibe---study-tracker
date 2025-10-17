// js/modules/achievements.js
import * as Storage from './storage.js';

let achievementsGrid;

export function init(AppState) {
    achievementsGrid = document.getElementById('achievementsGrid');
    renderAchievements();
}

export function renderAchievements() {
    const AppData = Storage.getAppData();
    achievementsGrid.innerHTML = '';
    
    const achievements = [
        // Streak achievements
        { id: 'weekly_warrior', name: 'Weekly Warrior', description: '7-day study streak', icon: 'fa-fire', target: 7, type: 'streak' },
        { id: 'monthly_master', name: 'Monthly Master', description: '30-day study streak', icon: 'fa-trophy', target: 30, type: 'streak' },
        { id: 'half_century', name: 'Half Century', description: '50-day study streak', icon: 'fa-flag', target: 50, type: 'streak' },
        { id: 'century_club', name: 'Century Club', description: '100-day study streak', icon: 'fa-crown', target: 100, type: 'streak' },
        { id: 'virtuoso', name: 'Virtuoso', description: '150-day study streak', icon: 'fa-star', target: 150, type: 'streak' },
        { id: 'sage', name: 'Sage', description: '200-day study streak', icon: 'fa-gem', target: 200, type: 'streak' },
        { id: 'grand_master', name: 'Grand Master', description: '365-day study streak', icon: 'fa-medal', target: 365, type: 'streak' },
        
        // Playlist achievements
        { id: 'first_steps', name: 'First Steps', description: 'First playlist created', icon: 'fa-play-circle', target: 1, type: 'playlist_count' },
        { id: 'course_conqueror', name: 'Course Conqueror', description: 'First playlist completed', icon: 'fa-check-circle', target: 1, type: 'completed_playlists' },
        { id: 'knowledge_seeker', name: 'Knowledge Seeker', description: '5 playlists completed', icon: 'fa-book', target: 5, type: 'completed_playlists' },
        { id: 'learning_luminary', name: 'Learning Luminary', description: '10 playlists completed', icon: 'fa-lightbulb', target: 10, type: 'completed_playlists' },
        { id: 'master_of_mastery', name: 'Master of Mastery', description: '25 playlists completed', icon: 'fa-graduation-cap', target: 25, type: 'completed_playlists' },
        
        // Focus Mode achievements
        { id: '5_hour_power', name: '5-Hour Power', description: 'Accumulate 5 hours of total study time', icon: 'fa-clock', target: 5, type: 'focus_time' },
        { id: '10_hour_hustler', name: '10-Hour Hustler', description: 'Accumulate 10 hours of total study time', icon: 'fa-bolt', target: 10, type: 'focus_time' },
        { id: '25_hour_scholar', name: '25-Hour Scholar', description: 'Accumulate 25 hours of total study time', icon: 'fa-graduation-cap', target: 25, type: 'focus_time' },
        { id: '50_hour_master', name: '50-Hour Master', description: 'Accumulate 50 hours of total study time', icon: 'fa-crown', target: 50, type: 'focus_time' },
        { id: '100_hour_virtuoso', name: '100-Hour Virtuoso', description: 'Accumulate 100 hours of total study time', icon: 'fa-star', target: 100, type: 'focus_time' },
        { id: '250_hour_sage', name: '250-Hour Sage', description: 'Accumulate 250 hours of total study time', icon: 'fa-gem', target: 250, type: 'focus_time' },
        { id: '500_hour_grand_master', name: '500-Hour Grand Master', description: 'Accumulate 500 hours of total study time', icon: 'fa-medal', target: 500, type: 'focus_time' },
        { id: '1000_hour_legend', name: '1000-Hour Legend', description: 'Accumulate 1000 hours of total study time', icon: 'fa-trophy', target: 1000, type: 'focus_time' }
    ];
    
    achievements.forEach(achievement => {
        let progress = 0;
        let current = 0;
        let earned = false;
        
        if (achievement.type === 'streak') {
            current = AppData.streak;
            progress = Math.min(current / achievement.target * 100, 100);
            earned = current >= achievement.target;
        } else if (achievement.type === 'playlist_count') {
            current = AppData.playlists.length;
            progress = Math.min(current / achievement.target * 100, 100);
            earned = current >= achievement.target;
        } else if (achievement.type === 'completed_playlists') {
            current = AppData.playlists.filter(p => p.progress === 100).length;
            progress = Math.min(current / achievement.target * 100, 100);
            earned = current >= achievement.target;
        } else if (achievement.type === 'focus_time') {
            current = AppData.totalFocusTime;
            progress = Math.min(current / achievement.target * 100, 100);
            earned = current >= achievement.target;
        }
        
        const achievementEl = document.createElement('div');
        achievementEl.className = `achievement-card ${earned ? 'earned' : ''}`;
        achievementEl.innerHTML = `
            <div class="achievement-icon">
                <i class="fas ${achievement.icon}"></i>
            </div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-desc">${achievement.description}</div>
            ${!earned ? `
                <div class="achievement-progress">
                    <div class="achievement-progress-bar" style="width: ${progress}%"></div>
                </div>
                <div style="margin-top: 5px; font-size: 0.8rem;">
                    ${achievement.type === 'focus_time' ? 
                        `${current.toFixed(1)}/${achievement.target} hours` : 
                        `${current}/${achievement.target}`}
                </div>
            ` : ''}
        `;
        achievementsGrid.appendChild(achievementEl);
    });
}

export function checkStreakAchievements() {
    renderAchievements();
}

export function checkPlaylistAchievements() {
    renderAchievements();
}

export function checkFocusAchievements() {
    renderAchievements();
}