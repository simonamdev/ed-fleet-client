import JournalTracker from './journal/journal-tracker';
import JournalWatcher from './journal/journal-watcher';
import JournalInterface from './journal/journal-interface';

export default class Journal {
    constructor(directory) {
        this.directory = pathInput.value;
        this.tracker = new JournalTracker();
        this.watcher = new JournalWatcher(this.tracker, pathInput.value);
        this.interface = new JournalInterface(this.watcher);
    }
}
