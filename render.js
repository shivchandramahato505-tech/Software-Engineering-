document.addEventListener('DOMContentLoaded', async() => {

    // =========================
    // ELEMENTS
    // =========================

    const textarea = document.getElementById('note');

    const saveBtn = document.getElementById('save');

    const saveAsBtn = document.getElementById('save-as');

    const newNoteBtn = document.getElementById('new-note');

    const openBtn = document.getElementById('open-file');

    const deleteBtn = document.getElementById('deleteBtn');

    const statusEl = document.getElementById('status');


    // =========================
    // VARIABLES
    // =========================

    let currentFilePath = null;

    let lastSavedText = '';


    // =========================
    // LOAD NOTE
    // =========================

    const savedNote = await window.electronAPI.loadNote();

    textarea.value = savedNote || '';

    lastSavedText = textarea.value;


    // =========================
    // SAVE FUNCTION
    // =========================

    async function saveHandler() {

        const result = await window.electronAPI.saveNote(
            textarea.value,
            currentFilePath
        );

        if (result.success) {

            currentFilePath = result.filePath;

            lastSavedText = textarea.value;

            statusEl.textContent = 'Saved Successfully';

        }

    }


    // =========================
    // SAVE AS FUNCTION
    // =========================

    async function saveAsHandler() {

        const result = await window.electronAPI.saveAs(
            textarea.value
        );

        if (result.success) {

            currentFilePath = result.filePath;

            lastSavedText = textarea.value;

            statusEl.textContent = 'Saved As Successfully';

        }

    }


    // =========================
    // OPEN FILE
    // =========================

    async function openHandler() {

        const result = await window.electronAPI.openFile();

        if (result.success) {

            textarea.value = result.content;

            currentFilePath = result.filePath;

            lastSavedText = result.content;

            statusEl.textContent = 'File Opened';

        }

    }


    // =========================
    // NEW NOTE
    // =========================

    async function newHandler() {

        const hasUnsavedChanges =
            textarea.value !== lastSavedText;

        if (hasUnsavedChanges) {

            const result =
                await window.electronAPI.newNote();

            if (!result.confirmed) {
                return;
            }

        }

        textarea.value = '';

        currentFilePath = null;

        lastSavedText = '';

        statusEl.textContent = 'New Note Created';

    }


    // =========================
    // DELETE ALL
    // =========================

    if (deleteBtn) {

        deleteBtn.addEventListener('click', async() => {

            await window.electronAPI.deleteAll();

            textarea.value = '';

            currentFilePath = null;

            lastSavedText = '';

            statusEl.textContent = 'Deleted All Notes';

        });

    }


    // =========================
    // AUTO SAVE
    // =========================

    async function autoSave() {

        if (textarea.value === lastSavedText) {
            return;
        }

        const result = await window.electronAPI.saveNote(
            textarea.value,
            currentFilePath
        );

        if (result.success) {

            currentFilePath = result.filePath;

            lastSavedText = textarea.value;

            statusEl.textContent = 'Auto Saved';

        }

    }


    // =========================
    // INPUT EVENT
    // =========================

    let timer;

    textarea.addEventListener('input', () => {

        statusEl.textContent = 'Typing...';

        clearTimeout(timer);

        timer = setTimeout(() => {

            autoSave();

        }, 5000);

    });


    // =========================
    // BUTTON EVENTS
    // =========================

    if (saveBtn) {
        saveBtn.addEventListener('click', saveHandler);
    }

    if (saveAsBtn) {
        saveAsBtn.addEventListener('click', saveAsHandler);
    }

    if (openBtn) {
        openBtn.addEventListener('click', openHandler);
    }

    if (newNoteBtn) {
        newNoteBtn.addEventListener('click', newHandler);
    }


    // =========================
    // MENU EVENTS
    // =========================

    window.electronAPI.onSave(() => {
        saveHandler();
    });

    window.electronAPI.onSaveAs(() => {
        saveAsHandler();
    });

    window.electronAPI.onOpenFile(() => {
        openHandler();
    });

    window.electronAPI.onNewNote(() => {
        newHandler();
    });

});
