import os from 'os';
import path from 'path';
import Journal from './components/journal';
import packageJson from '../package.json';
import { ipcRenderer } from 'electron';


// References to DOM elements
let pathInput = document.getElementById('pathInput');
let startButton = document.getElementById('startButton');
let stopButton = document.getElementById('stopButton');

let serverInput = document.getElementById('serverInput');
let serverButton = document.getElementById('serverButton');

let settingsButton = document.getElementById('settingsButton');
let settingsModal = document.getElementById('settingsModal');
let modalCloseButton = document.getElementById('modalClose');

let versionEl = document.getElementById('version');

// Global reference to journal to stop user from starting more than one
let journal;

// Add default directory to input
let defaultPath = path.join(
    os.homedir(),
    'Saved Games',
    'Frontier Developments',
    'Elite Dangerous'
);
// Set default value to default path in the input field
// pathInput.value = defaultPath;
// Attach event to button to start watcher
startButton.addEventListener('click', () => {
    journal = new Journal(pathInput.value, serverInput.value);
    if (!journal.isActive()) {
        journal.startWatcher();
    }
});

stopButton.addEventListener('click', () => {
    if (journal && journal.isActive()) {
        journal.stopWatcher();
    }
});

const setUrl = () => {
    if (journal) {
        journal.setUrl(serverInput.value);
        journal.checkConnection();
    } else {
        console.log('Watcher is inactive');
    }
};

// Set the default value for the URL
// TODO: Replace this according to the process env variable for production
// serverInput.value = 'http://localhost:3000/';
// Attach event to button to set URL
// serverButton.addEventListener('click', setUrl);

// Draw the version number
versionEl.innerText = packageJson.version.toString();

// Attach the events to open/close the modal
settingsButton.addEventListener('click', () => {
    settingsModal.classList.add('is-active');
});
modalClose.addEventListener('click', () => {
    settingsModal.classList.remove('is-active');
});

ipcRenderer.on('ready', (event) => {
    console.log('IPC Renderer operational');
});
