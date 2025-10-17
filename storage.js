// js/modules/settings.js
import * as Storage from './storage.js';

let dataSizeEl, lastExportEl, exportDataBtn, importDataBtn, clearDataBtn;

export function init(AppState) {
    // Cache DOM elements
    dataSizeEl = document.getElementById('dataSize');
    lastExportEl = document.getElementById('lastExport');
    exportDataBtn = document.getElementById('exportData');
    importDataBtn = document.getElementById('importData');
    clearDataBtn = document.getElementById('clearData');

    setupEventListeners();
    updateDataStats();
}

function setupEventListeners() {
    exportDataBtn.addEventListener('click', exportData);
    importDataBtn.addEventListener('click', importData);
    clearDataBtn.addEventListener('click', clearAllData);
}

export function updateDataStats() {
    const AppData = Storage.getAppData();
    
    // Calculate data size
    const dataStr = JSON.stringify(AppData);
    const dataSize = new Blob([dataStr]).size;
    dataSizeEl.textContent = `${(dataSize / 1024).toFixed(2)} KB`;
    
    // Update last export
    if (AppData.settings.lastExport) {
        lastExportEl.textContent = new Date(AppData.settings.lastExport).toLocaleDateString();
    } else {
        lastExportEl.textContent = 'Never';
    }
}

export function exportData() {
    const AppData = Storage.getAppData();
    const dataStr = JSON.stringify(AppData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Eduvibe-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Update last export
    AppData.settings.lastExport = new Date().toISOString();
    Storage.saveAllData();
    updateDataStats();
    
    alert('Data exported successfully!');
}

export function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = event => {
            try {
                const importedData = JSON.parse(event.target.result);
                
                // Validate the imported data structure
                if (importedData.playlists && Array.isArray(importedData.playlists)) {
                    if (confirm('This will replace all your current data. Continue?')) {
                        // Update app data
                        const AppData = Storage.getAppData();
                        Object.assign(AppData, importedData);
                        
                        // Save to localStorage
                        Storage.saveAllData();
                        
                        // Reload the page to update all modules
                        location.reload();
                        
                        alert('Data imported successfully!');
                    }
                } else {
                    alert('Invalid data format. Please select a valid backup file.');
                }
            } catch (error) {
                alert('Error reading file. Please make sure it\'s a valid JSON file.');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

export function clearAllData() {
    if (confirm('This will permanently delete all your data. This action cannot be undone. Continue?')) {
        localStorage.clear();
        location.reload();
    }
}