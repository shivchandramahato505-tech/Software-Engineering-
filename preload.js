const { contextBridge, ipcRenderer } = require('electron');

console.log("PRELOAD WORKING");

contextBridge.exposeInMainWorld('electronAPI', {
    // ✅ Existing functions
    saveNote: (text, filePath) => ipcRenderer.invoke('save-note', text, filePath),
    loadNote: () => ipcRenderer.invoke('load-note'),
    saveAs: (text) => ipcRenderer.invoke('save-as', text),
    newNote: () => ipcRenderer.invoke('new-note'),
    deleteAll: () => ipcRenderer.invoke('delete-all'),
    openFile: () => ipcRenderer.invoke('open-file'),

    // ✅ ADD THESE (VERY IMPORTANT)
    onNewNote: (callback) => ipcRenderer.on('menu-new-note', callback),
    onOpenFile: (callback) => ipcRenderer.on('menu-open-file', callback),
    onSave: (callback) => ipcRenderer.on('menu-save', callback),
    onSaveAs: (callback) => ipcRenderer.on('menu-save-as', callback)
});
