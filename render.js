document.addEventListener('DOMContentLoaded', async() => {

    const textarea = document.getElementById('note');
    const saveBtn = document.getElementById('save');
    const saveAsBtn = document.getElementById('save-as');
    const newNoteBtn = document.getElementById('new-note');
    const openBtn = document.getElementById('open-file');
    const deleteBtn = document.getElementById('deleteBtn');
    const statusEl = document.getElementById('status');

    let currentFilePath = null;

    // ✅ Load Note
    const savedNote = await window.electronAPI.loadNote();
    textarea.value = savedNote || "";

    let lastSavedText = textarea.value;

    // =========================
    // ✅ BUTTON EVENTS
    // =========================

    // Save
    saveBtn.addEventListener('click', saveHandler);

    async function saveHandler() {
        const result = await window.electronAPI.saveNote(textarea.value, currentFilePath);

        if (result.success) {
            currentFilePath = result.filePath;
            lastSavedText = textarea.value;
            statusEl.textContent = "Saved successfully!";
        }
    }

    // Save As
    saveAsBtn.addEventListener('click', saveAsHandler);

    async function saveAsHandler() {
        const result = await window.electronAPI.saveAs(textarea.value);

        if (result.success) {
            currentFilePath = result.filePath;
            lastSavedText = textarea.value;
            statusEl.textContent = "Saved As successful";
        }
    }

    // Open File
    openBtn.addEventListener('click', openHandler);

    async function openHandler() {
        const result = await window.electronAPI.openFile();

        if (result.success) {
            textarea.value = result.content;
            lastSavedText = result.content;
            currentFilePath = result.filePath;
            statusEl.textContent = "File opened";
        }
    }

    // New Note
    newNoteBtn.addEventListener('click', newHandler);

    async function newHandler() {
        const result = await window.electronAPI.newNote();

        if (result.confirmed) {
            textarea.value = "";
            lastSavedText = "";
            currentFilePath = null;
            statusEl.textContent = "New note";
        }
    }

    // Delete All
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async() => {
            await window.electronAPI.deleteAll();

            textarea.value = "";
            lastSavedText = "";
            currentFilePath = null;
            statusEl.textContent = "Deleted all";
        });
    }

    // =========================
    // ✅ AUTO SAVE
    // =========================

    async function autoSave() {
        if (textarea.value === lastSavedText) return;

        const result = await window.electronAPI.saveNote(textarea.value, currentFilePath);

        if (result.success) {
            currentFilePath = result.filePath;
            lastSavedText = textarea.value;
            statusEl.textContent = "Auto saved";
        }
    }

    let timer;
    textarea.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(autoSave, 5000);
    });

    // =========================
    // 🔥 MENU EVENTS (IMPORTANT)
    // =========================

    window.electronAPI.onSave(saveHandler);
    window.electronAPI.onSaveAs(saveAsHandler);
    window.electronAPI.onOpenFile(openHandler);
    window.electronAPI.onNewNote(newHandler);

});
