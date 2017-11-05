import Journal from './components/journal';
import packageJson from '../package.json';
import { ipcRenderer } from 'electron';

// TODO: Move DOM references into a separate class
// References to DOM elements
let startButton = document.getElementById('startButton');
let stopButton = document.getElementById('stopButton');

let pathInput = document.getElementById('pathInput');
let serverInput = document.getElementById('serverInput');
let cmdrInput = document.getElementById('cmdrInput');
let apiInput = document.getElementById('apiInput');

let settingsButton = document.getElementById('settingsButton');
let settingsModal = document.getElementById('settingsModal');
let settingsSaveButton = document.getElementById('settingsSave');
let modalCloseButton = document.getElementById('modalClose');


let clientVersionEl = document.getElementById('clientVersion');
let serverVersionEl = document.getElementById('serverVersion');

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

// TODO: Version checks and drawing
// Draw the client version number taken from the package.json file
clientVersionEl.innerText = packageJson.version.toString();

// Setup server version check on watcher successful connection
// TODO

// Setup fleet name drawing on watcher successful connection
// TODO

// Setup Modal
// Attach modal events
settingsButton.addEventListener('click', () => {
    settingsModal.classList.add('is-active');
});

modalClose.addEventListener('click', () => {
    settingsModal.classList.remove('is-active');
});

// Validate fields that are not empty
const validateOnContent = (e) => {
    let element = e.target || e;
    if (element.value && element.value.length) {
        element.classList.remove('is-danger');
    } else {
        element.classList.add('is-danger');
    }
};

// Attach validation events
[pathInput, serverInput, cmdrInput, apiInput].forEach((inputEl) => {
    validateOnContent(inputEl);
    inputEl.addEventListener('input', validateOnContent);
});

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
