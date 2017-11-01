import os from 'os';
import path from 'path';
import Journal from './components/journal';

// References to DOM elements
let pathInput = document.getElementById('pathInput');
let pathButton = document.getElementById('pathButton');

// Global reference to journal to stop user from starting more than one
let journal = new Journal(pathInput.value);

const startWatcher = () => {
    journal.startWatcher();
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
