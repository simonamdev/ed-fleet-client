import JournalWatcher from './components/journal-watcher';

const startWatcher = () => {
    const filePath = document.getElementById('pathInput').value;
    const watcher = new JournalWatcher(filePath);
    console.log('Starting watcher');
    watcher.watchFile();
};

document.querySelector('#pathButton').addEventListener('click', startWatcher);
