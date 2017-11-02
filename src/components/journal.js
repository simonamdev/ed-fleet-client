import JournalTracker from './journal/journal-tracker';
import JournalWatcher from './journal/journal-watcher';
import JournalTransmitter from './journal/journal-transmitter';

export default class Journal {
    constructor(directory, url) {
        this.directory = directory;
        this.url = url;
        this.tracker = new JournalTracker();
        this.watcher = new JournalWatcher(this.directory);
        this.transmitter = new JournalTransmitter(this.url);
        this.init();
    }

    init() {
        let self = this;
        // Setup references to DOM elements
        self.dataCountEl = document.getElementById('dataCount');
        self.lastEventEl = document.getElementById('lastEvent');
        self.watcherStateEl = document.getElementById('watcherState');
        self.serverStateEl = document.getElementById('serverState');
        // Subscribe to watcher events
        self.watcher.on('watcherUpdate', (obs) => {
            // To avoid sending the whole file on startup, skip updating the state if
            // the number of lines is greater than say 15
            if (obs.length <= 15) {
                console.log(obs);
                this.updateState(obs);
                self.updateEventsUi();
            }
        });
        // TODO: Subscribe to transmission events
    }

    updateEventsTelemetry(data) {
        this.tracker.addLoadedEventsCount(data.length);
        this.tracker.addRecentEvents(data);
    }

    updateEventsUi() {
        this.dataCountEl.innerText = this.tracker.getEventCount();
        this.lastEventEl.innerText = this.tracker.getLastEvent().event;
    }

    updateServerUi() {
        this.serverStateEl.classList.remove('in-progress');
        this.serverStateEl.innerText = this.tracker.getConnectionState();
    }

    startWatcher() {
        this.tracker.setWatcherState(true);
        this.updateWatcher();
        this.watcher.init();
    }

    stopWatcher() {
        this.tracker.setWatcherState(false);
        this.updateWatcher();
        this.watcher.stop();
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

    checkConnection() {
        this.tracker.setConnectionState('Attempting to connect');
        this.updateServerUi();
        this.serverStateEl.classList.remove('active');
        this.serverStateEl.classList.remove('inactive');
        this.serverStateEl.classList.add('in-progress');
        return this.transmitter.checkLatency().then((response) => {
            this.tracker.setConnectionState(`Latency: ${response.latency}ms`);
            this.serverStateEl.classList.add('active');
            this.serverStateEl.classList.remove('inactive');
            this.updateServerUi();
            return true;
        }).catch((error) => {
            this.tracker.setConnectionState(`Unable to connect: ${error}`);
            this.serverStateEl.classList.add('inactive');
            this.serverStateEl.classList.remove('active');
            this.updateServerUi();
            return false;
        });
    }

    isActive() {
        return this.tracker.getWatcherState();
    }
}
