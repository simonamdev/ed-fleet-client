import os from 'os';
import path from 'path';
import Journal from './components/journal';
import packageJson from '../package.json';

// UPDATER STUFF
import { autoUpdater } from "electron-updater";
const log = require('electron-log');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

// Updater stuff
autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update');
    log.info('Checking for update');
});

autoUpdater.on('update-available', (info) => {
    console.log('Update available.');
    log.info('Update available');

})
autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available.');
    log.info('Upate not available');

})
autoUpdater.on('error', (err) => {
    console.log('Error in auto-updater. ' + err);
    log.info('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    console.log(log_message);
    log.info(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded');
    log.info('Update downloaded');
});

documet.getElementById('updateButton').addEventListener('click', () => {
    autoUpdater.checkForUpdatesAndNotify();
});
// UPDATER STUFF


// References to DOM elements
let pathInput = document.getElementById('pathInput');
let pathButton = document.getElementById('pathButton');

let serverInput = document.getElementById('serverInput');
let serverButton = document.getElementById('serverButton');

let versionSpan = document.getElementById('version');

// Global reference to journal to stop user from starting more than one
let journal;

const startWatcher = () => {
    journal = new Journal(pathInput.value, serverInput.value);
    if (!journal.isActive()) {
        journal.startWatcher();
    }
};

// Add default directory to input
let defaultPath = path.join(
    os.homedir(),
    'Saved Games',
    'Frontier Developments',
    'Elite Dangerous'
);
// Set default value to default path in the input field
pathInput.value = defaultPath;
// Attach event to button to start watcher
pathButton.addEventListener('click', startWatcher);

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
serverInput.value = 'http://localhost:3000/';
// Attach event to button to set URL
serverButton.addEventListener('click', setUrl);

// Draw the version number
versionSpan.innerText = packageJson.version.toString();
