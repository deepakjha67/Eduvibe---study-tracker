// js/modules/navigation.js
import * as Storage from './storage.js';

let navTabs, mobileNavTabs, navContents, floatingAddBtn;

export function init(AppState) {
    navTabs = document.querySelectorAll('.nav-tab');
    mobileNavTabs = document.querySelectorAll('.mobile-nav-tab');
    navContents = document.querySelectorAll('.nav-content');
    floatingAddBtn = document.getElementById('floatingAddBtn');

    setupEventListeners();
}

function setupEventListeners() {
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => switchNavTab(tab.dataset.tab));
    });
    
    mobileNavTabs.forEach(tab => {
        tab.addEventListener('click', () => switchNavTab(tab.dataset.tab));
    });
}

export function switchNavTab(tabName) {
    // Update active desktop nav tab
    navTabs.forEach(tab => {
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Update active mobile nav tab
    mobileNavTabs.forEach(tab => {
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Update active nav content
    navContents.forEach(content => {
        if (content.id === `${tabName}-content`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
    
    // Update floating button visibility
    if (tabName === 'courses' || tabName === 'goals') {
        floatingAddBtn.style.display = 'flex';
    } else {
        floatingAddBtn.style.display = 'none';
    }
}