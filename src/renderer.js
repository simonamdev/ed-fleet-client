import os from 'os';
import path from 'path';
import JournalWatcher from './components/journal-watcher';

// Global reference to watcher to stop user from starting more than one
let watcher;
let pathInput = document.getElementById('pathInput');
let pathButton = document.getElementById('pathButton');

const startWatcher = () => {
    if (watcher) {
        // TODO: Show errors on window
        console.log(`Error: watcher already started for file: ${watcher.directory}`);
    } else {
        watcher = new JournalWatcher(pathInput.value);
        watcher.init();
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
