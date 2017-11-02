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
        this.connectionCheck = null;
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
                this.updateEventsTelemetry(obs);
                self.updateEventsUi();
                let events = obs.slice();
                setImmediate(() => {
                    for (let i = 0; i < events.length; i++) {
                        let ev = events[i];
                        setImmediate(() => {
                            self.transmitter.sendEvent(ev).catch((err) => {
                                if (ev) {
                                    console.error(`Error: ${err} sending event: ${ev.event}`);
                                }
                            });
                        });
                    }
                }, 0, events);
            }
        });
        // TODO: Subscribe to transmission events
    }

    setUrl(url) {
        this.url = url;
    }

    startWatcher() {
        this.tracker.setWatcherState(true);
        this.updateWatcherUi();
        this.watcher.init();
    }

    stopWatcher() {
        this.tracker.setWatcherState(false);
        this.updateWatcherUi();
        this.watcher.stop();
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

    updateWatcherUi() {
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
        // TODO: Set as spinner instead of text
        this.tracker.setConnectionState('Attempting to connect');
        this.updateServerUi();
        this.serverStateEl.classList.remove('active');
        this.serverStateEl.classList.remove('inactive');
        this.serverStateEl.classList.add('in-progress');
        this.transmitter.checkLatency().then((response) => {
            this.tracker.setConnectionState(`Latency: ${response.latency}ms`);
            this.serverStateEl.classList.add('active');
            this.serverStateEl.classList.remove('inactive');
            this.updateServerUi();
            if (!this.connectionCheck) {
                let self = this;
                this.connectionCheck = setInterval(() => {
                    self.checkConnection();
                }, 5000);
            }
        }).catch((error) => {
            this.tracker.setConnectionState(`Unable to connect: ${error}`);
            this.serverStateEl.classList.add('inactive');
            this.serverStateEl.classList.remove('active');
            this.updateServerUi();
        });
    }

    isActive() {
        return this.tracker.getWatcherState();
    }
}
