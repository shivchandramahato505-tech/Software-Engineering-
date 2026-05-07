const { contextBridge, ipcRenderer } = require('electron');

console.log('PRELOAD WORKING');

contextBridge.exposeInMainWorld('electronAPI', {

    // =========================
    // MAIN FUNCTIONS
    // =========================

    loadNote: () =>
        ipcRenderer.invoke('load-note'),

    saveNote: (text, filePath) =>
        ipcRenderer.invoke('save-note', text, filePath),

    saveAs: (text) =>
        ipcRenderer.invoke('save-as', text),

    openFile: () =>
        ipcRenderer.invoke('open-file'),

    newNote: () =>
        ipcRenderer.invoke('new-note'),

    deleteAll: () =>
        ipcRenderer.invoke('delete-all'),


    // =========================
    // MENU EVENTS
    // =========================

    onNewNote: (callback) =>
        ipcRenderer.on('menu-new-note', callback),

    onOpenFile: (callback) =>
        ipcRenderer.on('menu-open-file', callback),

    onSave: (callback) =>
        ipcRenderer.on('menu-save', callback),

    onSaveAs: (callback) =>
        ipcRenderer.on('menu-save-as', callback)

});
