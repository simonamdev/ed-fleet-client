import JournalWatcher from './components/journal-watcher';

// Global reference to watcher to stop user from starting more than one
let watcher;

const startWatcher = () => {
    if (watcher) {
        // TODO: Show errors on window
        console.log(`Error: watcher already started for file: ${watcher.path}`);
    } else {
        const filePath = document.getElementById('pathInput').value;
        watcher = new JournalWatcher(filePath);
        console.log('Starting watcher');
        watcher.watchFile();
    }
};

// Attach event to button
document.querySelector('#pathButton').addEventListener('click', startWatcher);
