const { contextBridge, ipcRenderer } = require('electron');

console.log("PRELOAD WORKING");

contextBridge.exposeInMainWorld('electronAPI', {
    saveNote: (text, filePath) => ipcRenderer.invoke('save-note', text, filePath),
    loadNote: () => ipcRenderer.invoke('load-note'),
    saveAs: (text) => ipcRenderer.invoke('save-as', text),
    newNote: () => ipcRenderer.invoke('new-note'),
    deleteAll: () => ipcRenderer.invoke('delete-all'),
    openFile: () => ipcRenderer.invoke('open-file')
});