import os from 'os';
import path from 'path';
import Journal from './components/journal';

// References to DOM elements
let pathInput = document.getElementById('pathInput');
let pathButton = document.getElementById('pathButton');

let serverInput = document.getElementById('serverInput');
let serverButton = document.getElementById('serverButton');

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

const checkServer = () => {
    if (journal) {
        journal.checkConnection();
    } else {
        console.log('Watcher is inactive');
    }
};

// Set the default value for the URL
// TODO: Replace this according to the process env variable for production
serverInput.value = 'http://localhost:4000/';
// Attach event to button to check connection
serverButton.addEventListener('click', checkServer);
