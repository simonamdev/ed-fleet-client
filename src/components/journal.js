import JournalTracker from './journal/journal-tracker';
import JournalWatcher from './journal/journal-watcher';
import JournalInterface from './journal/journal-interface';
import JournalTransmitter from './journal/journal-transmitter';

export default class Journal {
    constructor(directory, url) {
        this.directory = directory;
        this.url = url;
        this.tracker = new JournalTracker();
        this.watcher = new JournalWatcher(this.tracker, this.directory);
        this.interface = new JournalInterface(this.watcher, this.tracker);
        this.transmitter = new JournalTransmitter(this.url);
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
        return this.transmitter.checkLatency();
    }

    isActive() {
        return this.tracker.getWatcherState();
    }
}
