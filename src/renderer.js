import packageJson from '../package.json';
import { ipcRenderer } from 'electron';
import Uplink from './components/uplink';
import Survey from './components/survey';
import Settings from './components/settings';
import About from './components/settings';

// TODO: Move DOM references into a separate class
// References to DOM elements
let startButton = document.getElementById('startButton');

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
// let settings = {
//     path: pathInput.value,
//     url: serverInput.value,
//     commander: cmdrInput.value,
//     apiKey: apiInput.value
// };
let uplink = new Uplink();

// Attach event to button to start watcher
startButton.addEventListener('click', () => {
    if (uplink && !uplink.isActive()) {
        uplink.init();
        uplink.start();
    } else {
        uplink.stop();
    }
});

// TODO: Move to about page
// TODO: Version checks and drawing
// Draw the client version number taken from the package.json file
// clientVersionEl.innerText = packageJson.version.toString();

// Setup server version check on watcher successful connection
// TODO

// Setup fleet name drawing on watcher successful connection
// TODO

// TODO: Move to settings file
// Validate fields that are not empty
const validateOnContent = (e) => {
    let element = e.target || e;
    if (element.value && element.value.length) {
        element.classList.remove('is-danger');
    } else {
        element.classList.add('is-danger');
    }
};

// TODO: Move to settings file
// Attach validation events
// [pathInput, serverInput, cmdrInput, apiInput].forEach((inputEl) => {
//     validateOnContent(inputEl);
//     inputEl.addEventListener('input', validateOnContent);
// });

// TODO: Move to settings file
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
