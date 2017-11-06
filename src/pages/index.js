import { ipcRenderer } from 'electron';
import Uplink from './components/uplink';

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

ipcRenderer.on('ready', (event) => {
    console.log('IPC Renderer operational');
});
