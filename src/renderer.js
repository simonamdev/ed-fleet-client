import JournalWatcher from './components/journal-watcher';

let watcher = new JournalWatcher('G:\\Documents\\GitHub\\ed-fleet-client\\test.txt');
console.log('Starting watcher');
watcher.watchFile();
