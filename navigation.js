// js/modules/storage.js
const AppData = {
    version: "2.0",
    playlists: [],
    streak: 0,
    lastCompletedDate: '',
    studyHistory: {},
    dailyGoals: [],
    goalProgress: {
        dailyCompletion: 0,
        weeklyAverage: 0,
        trends: []
    },
    achievements: {
        unlocked: [],
        progress: {}
    },
    focusHistory: [],
    totalFocusTime: 0,
    settings: {
        lastExport: null,
        autoBackup: false
    }
};

export function loadAllData() {
    AppData.playlists = JSON.parse(localStorage.getItem('learningPlaylists')) || [];
    AppData.streak = parseInt(localStorage.getItem('learningStreak')) || 0;
    AppData.lastCompletedDate = localStorage.getItem('lastCompletedDate') || '';
    AppData.studyHistory = JSON.parse(localStorage.getItem('studyHistory')) || {};
    AppData.dailyGoals = JSON.parse(localStorage.getItem('dailyGoals')) || [];
    AppData.goalProgress = JSON.parse(localStorage.getItem('goalProgress')) || AppData.goalProgress;
    AppData.achievements = JSON.parse(localStorage.getItem('achievements')) || AppData.achievements;
    AppData.focusHistory = JSON.parse(localStorage.getItem('focusHistory')) || [];
    AppData.totalFocusTime = parseFloat(localStorage.getItem('totalFocusTime')) || 0;
    AppData.settings = JSON.parse(localStorage.getItem('settings')) || AppData.settings;
}

export function saveAllData() {
    localStorage.setItem('learningPlaylists', JSON.stringify(AppData.playlists));
    localStorage.setItem('learningStreak', AppData.streak);
    localStorage.setItem('lastCompletedDate', AppData.lastCompletedDate);
    localStorage.setItem('studyHistory', JSON.stringify(AppData.studyHistory));
    localStorage.setItem('dailyGoals', JSON.stringify(AppData.dailyGoals));
    localStorage.setItem('goalProgress', JSON.stringify(AppData.goalProgress));
    localStorage.setItem('achievements', JSON.stringify(AppData.achievements));
    localStorage.setItem('focusHistory', JSON.stringify(AppData.focusHistory));
    localStorage.setItem('totalFocusTime', AppData.totalFocusTime);
    localStorage.setItem('settings', JSON.stringify(AppData.settings));
}

export function savePlaylists() {
    localStorage.setItem('learningPlaylists', JSON.stringify(AppData.playlists));
}

export function getAppData() {
    return AppData;
}

export function updateAppData(newData) {
    Object.assign(AppData, newData);
    saveAllData();
}