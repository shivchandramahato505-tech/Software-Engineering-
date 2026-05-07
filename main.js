const { app, BrowserWindow, ipcMain, dialog, Menu, Tray } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

let tray = null;

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

    // =========================
    // HIDE WINDOW INSTEAD CLOSE
    // =========================

    win.on('close', (event) => {

        if (!app.isQuiting) {

            event.preventDefault();

            win.hide();

        }

    });

}

app.whenReady().then(() => {

    createWindow();

    // =========================
    // SYSTEM TRAY
    // =========================

    tray = new Tray(path.join(__dirname, 'icon.png'));

    const trayMenu = Menu.buildFromTemplate([

        {
            label: 'Show App',

            click: () => {

                const win = BrowserWindow.getAllWindows()[0];

                if (win) {
                    win.show();
                }

            }
        },

        {
            label: 'Quit',

            click: () => {

                app.isQuiting = true;

                app.quit();

            }
        }

    ]);

    tray.setToolTip('Quick Note Taker');

    tray.setContextMenu(trayMenu);

    // =========================
    // DOUBLE CLICK TRAY ICON
    // =========================

    tray.on('double-click', () => {

        const win = BrowserWindow.getAllWindows()[0];

        if (win.isVisible()) {
            win.hide();
        } else {
            win.show();
        }

    });

    // =========================
    // FILE MENU
    // =========================

    const menuTemplate = [

        {
            label: 'File',

            submenu: [

                {
                    label: 'New Note',

                    accelerator: 'CmdOrCtrl+N',

                    click: () => {

                        const win = BrowserWindow.getFocusedWindow();

                        if (win) {
                            win.webContents.send('menu-new-note');
                        }

                    }
                },

                {
                    label: 'Open File',

                    accelerator: 'CmdOrCtrl+O',

                    click: () => {

                        const win = BrowserWindow.getFocusedWindow();

                        if (win) {
                            win.webContents.send('menu-open-file');
                        }

                    }
                },

                {
                    label: 'Save',

                    accelerator: 'CmdOrCtrl+S',

                    click: () => {

                        const win = BrowserWindow.getFocusedWindow();

                        if (win) {
                            win.webContents.send('menu-save');
                        }

                    }
                },

                {
                    label: 'Save As',

                    accelerator: 'CmdOrCtrl+Shift+S',

                    click: () => {

                        const win = BrowserWindow.getFocusedWindow();

                        if (win) {
                            win.webContents.send('menu-save-as');
                        }

                    }
                },

                {
                    type: 'separator'
                },

                {
                    label: 'Quit',

                    accelerator: 'CmdOrCtrl+Q',

                    click: () => {

                        app.isQuiting = true;

                        app.quit();

                    }
                }

            ]
        }

    ];

    const menu = Menu.buildFromTemplate(menuTemplate);

    Menu.setApplicationMenu(menu);

    // =========================
    // ACTIVATE
    // =========================

    app.on('activate', () => {

        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }

    });

});

// =========================
// BEFORE QUIT
// =========================

app.on('before-quit', () => {

    app.isQuiting = true;

});

// =========================
// WINDOW ALL CLOSED
// =========================

app.on('window-all-closed', () => {

    if (process.platform !== 'darwin') {
        app.quit();
    }

});

// =========================
// LOAD NOTE
// =========================

ipcMain.handle('load-note', async() => {

    const filePath = getNotePath();

    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8');
    }

    return '';

});

// =========================
// SAVE NOTE
// =========================

ipcMain.handle('save-note', async(event, text, filePath) => {

    const savePath = filePath || getNotePath();

    fs.writeFileSync(savePath, text, 'utf-8');

    return {
        success: true,
        filePath: savePath
    };

});

// =========================
// SAVE AS
// =========================

ipcMain.handle('save-as', async(event, text) => {

    const result = await dialog.showSaveDialog({

        defaultPath: 'mynote.txt',

        filters: [{
            name: 'Text Files',
            extensions: ['txt']
        }]

    });

    if (result.canceled) {

        return {
            success: false
        };

    }

    fs.writeFileSync(result.filePath, text, 'utf-8');

    return {
        success: true,
        filePath: result.filePath
    };

});

// =========================
// OPEN FILE
// =========================

ipcMain.handle('open-file', async() => {

    const result = await dialog.showOpenDialog({

        properties: ['openFile'],

        filters: [{
            name: 'Text Files',
            extensions: ['txt']
        }]

    });

    if (result.canceled) {

        return {
            success: false
        };

    }

    const filePath = result.filePaths[0];

    const content = fs.readFileSync(filePath, 'utf-8');

    return {
        success: true,
        content: content,
        filePath: filePath
    };

});

// =========================
// NEW NOTE
// =========================

ipcMain.handle('new-note', async() => {

    const result = await dialog.showMessageBox({

        type: 'warning',

        buttons: ['Discard Changes', 'Cancel'],

        defaultId: 1,

        title: 'Unsaved Changes',

        message: 'You have unsaved changes. Start new note anyway?'

    });

    return {
        confirmed: result.response === 0
    };

});

// =========================
// DELETE ALL
// =========================

ipcMain.handle('delete-all', async() => {

    fs.writeFileSync(getNotePath(), '', 'utf-8');

    return {
        success: true
    };

});
