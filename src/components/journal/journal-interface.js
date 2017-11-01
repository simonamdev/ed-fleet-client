export default class JournalInterface {
    constructor(watcher) {
        this.watcher = watcher;
        this.tracker = watcher.tracker;
        this.init();
    }

    init() {
        let self = this;
        // Setup references to DOM elements
        self.dataCountEl = document.getElementById('dataCount');
        self.lastEventEl = document.getElementById('lastEvent');
        self.watcherStateEl = document.getElementById('watcherState');
        // Subscribe to watcher events
        self.watcher.on('update', () => {
            self.updateEvents();
        });
        // TODO: Subscribe to transmission events
    }

    updateEvents() {
        document.getElementById('dataCount').innerText = this.tracker.getEventCount();
        document.getElementById('lastEvent').innerText = this.tracker.getLastEvent().event;
    }

    updateWatcher() {
        if (this.tracker.getWatcherState()) {
            this.watcherStateEl.classList.add('watcher-active');
        } else {
            this.watcherStateEl.classList.remove('watcher-active');
        }
    }
}
