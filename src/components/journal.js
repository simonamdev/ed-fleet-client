import JournalTracker from './journal/journal-tracker';
import JournalWatcher from './journal/journal-watcher';
import JournalInterface from './journal/journal-interface';

export default class Journal {
    constructor(directory) {
        this.directory = pathInput.value;
        this.tracker = new JournalTracker();
        this.watcher = new JournalWatcher(this.tracker, pathInput.value);
        this.interface = new JournalInterface(this.watcher, this.tracker);
    }

    startWatcher() {
        this.tracker.setWatcherState(true);
        this.interface.updateWatcher();
        this.watcher.init();
    }

    stopWatcher() {
        this.tracker.setWatcherState(false);
        this.interface.updateWatcher();
        this.watcher.stop();
    }

    checkConnection() {

    }

    isActive() {
        return this.tracker.getWatcherState();
    }
}
