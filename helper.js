// js/utils/helpers.js
export function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export function getSourceIcon(source) {
    const icons = {
        'youtube': 'youtube',
        'udemy': 'graduation-cap',
        'coursera': 'university',
        'other': 'link'
    };
    return icons[source] || 'play-circle';
}

export function getStatusClass(video) {
    if (video.completed) return 'status-completed';
    if (video.locked) return 'status-locked';
    return 'status-pending';
}

export function getStatusText(video) {
    if (video.completed) return 'Completed';
    if (video.locked) return 'Locked';
    return 'Pending';
}