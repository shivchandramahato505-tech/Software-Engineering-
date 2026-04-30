const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

function getNotePath() {
    return path.join(app.getPath('documents'), 'quicknote.txt');
}

function createWindow() {
    const win = new BrowserWindow({
        width: 900,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Load Note
ipcMain.handle('load-note', async() => {
    const filePath = getNotePath();

    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8');
    }

    return '';
});

// Save Note
ipcMain.handle('save-note', async(event, text, filePath) => {
    const savePath = filePath || getNotePath();

    fs.writeFileSync(savePath, text, 'utf-8');

    return {
        success: true,
        filePath: savePath
    };
});

// Save As
ipcMain.handle('save-as', async(event, text) => {
    const result = await dialog.showSaveDialog({
        defaultPath: 'mynote.txt',
        filters: [
            { name: 'Text Files', extensions: ['txt'] }
        ]
    });

    if (result.canceled) {
        return { success: false };
    }

    fs.writeFileSync(result.filePath, text, 'utf-8');

    return {
        success: true,
        filePath: result.filePath
    };
});

// Open File
ipcMain.handle('open-file', async() => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Text Files', extensions: ['txt'] }
        ]
    });

    if (result.canceled) {
        return { success: false };
    }

    const filePath = result.filePaths[0];
    const content = fs.readFileSync(filePath, 'utf-8');

    return {
        success: true,
        content: content,
        filePath: filePath
    };
});

// New Note
ipcMain.handle('new-note', async() => {
    const result = await dialog.showMessageBox({
        type: 'warning',
        buttons: ['Discard Changes', 'Cancel'],
        defaultId: 1,
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Start new note anyway?'
    });

    return { confirmed: result.response === 0 };
});

// Delete All
ipcMain.handle('delete-all', async() => {
    fs.writeFileSync(getNotePath(), '', 'utf-8');
    return { success: true };
});