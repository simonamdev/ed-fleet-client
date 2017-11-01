import os from 'os';
import path from 'path';
import Journal from './components/journal';

// Global reference to watcher to stop user from starting more than one
let journal;
let pathInput = document.getElementById('pathInput');
let pathButton = document.getElementById('pathButton');

const startWatcher = () => {
    if (journal) {
        // TODO: Show errors on window
        console.log(`Error: watcher already started for file: ${watcher.directory}`);
    } else {
        journal = new Journal(pathInput.value);
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
