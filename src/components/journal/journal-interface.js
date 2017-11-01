export default class JournalInterface {
    constructor(watcher, tracker) {
        this.watcher = watcher;
        this.tracker = tracker;
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
            self.updateUI();
        });
        // TODO: Subscribe to transmission events
    }

    updateUI() {
        this.updateEvents();
    }

    updateEvents() {
        document.getElementById('dataCount').innerText = this.tracker.getEventCount();
        document.getElementById('lastEvent').innerText = this.tracker.getLastEvent().event;
    }

    // TODO: Move into updateUI?
    updateWatcher() {
        if (this.tracker.getWatcherState()) {
            this.watcherStateEl.classList.add('active');
            this.watcherStateEl.classList.remove('inactive');
            this.watcherStateEl.innerText = 'Active';
        } else {
            this.watcherStateEl.classList.add('inactive');
            this.watcherStateEl.classList.remove('active');
            this.watcherStateEl.innerText = 'Inactive';
        }
    }
}
