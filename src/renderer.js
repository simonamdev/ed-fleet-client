import Journal from './components/journal';
import packageJson from '../package.json';
import { ipcRenderer } from 'electron';


// References to DOM elements
let pathInput = document.getElementById('pathInput');
let startButton = document.getElementById('startButton');
let stopButton = document.getElementById('stopButton');

let serverInput = document.getElementById('serverInput');
let cmdrInput = document.getElementById('cmdrInput');
let apiInput = document.getElementById('apiInput');

let settingsButton = document.getElementById('settingsButton');
let settingsModal = document.getElementById('settingsModal');
let settingsSaveButton = document.getElementById('settingsSave');
let modalCloseButton = document.getElementById('modalClose');


let versionEl = document.getElementById('version');

// Global reference to journal to stop user from starting more than one
let settings = {
    path: pathInput.value,
    url: serverInput.value,
    commander: cmdrInput.value,
    apiKey: apiInput.value
};
let journal = new Journal(settings);

// Load in the settings if they are available
journal.loadSettingsIfAvailable();

// Attach event to button to start watcher
startButton.addEventListener('click', () => {
    if (!journal.isActive()) {
        journal.init();
        journal.startWatcher();
    }
});

stopButton.addEventListener('click', () => {
    if (journal && journal.isActive()) {
        journal.stopWatcher();
    }
});

// Draw the version number
versionEl.innerText = packageJson.version.toString();

// Setup Modal

// Attach modal events
settingsButton.addEventListener('click', () => {
    settingsModal.classList.add('is-active');
});

modalClose.addEventListener('click', () => {
    settingsModal.classList.remove('is-active');
});

// TODO: Validate fields are not empty
settingsSaveButton.addEventListener('click', () => {
    if (journal) {
        let settings = {
            path: pathInput.value,
            url: serverInput.value,
            commander: cmdrInput.value,
            apiKey: apiInput.value
        };
        journal.updateSettings(settings);
        journal.saveSettings();
    }
    settingsModal.classList.remove('is-active');
});

ipcRenderer.on('ready', (event) => {
    console.log('IPC Renderer operational');
});
