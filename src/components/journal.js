import JournalTracker from './journal/journal-tracker';
import JournalWatcher from './journal/journal-watcher';
import JournalTransmitter from './journal/journal-transmitter';

export default class Journal {
    constructor(directory, url, commander, apiKey) {
        this.directory = directory;
        this.url = url;
        this.commander = commander;
        this.apiKey = apiKey;
        this.tracker = new JournalTracker();
        this.watcher = new JournalWatcher(this.directory);
        this.transmitter = new JournalTransmitter(
            this.url,
            this.commander,
            this.apiKey
        );
        this.connectionCheck = null;
        this.init();
    }

    init() {
        let self = this;
        // Setup references to DOM elements
        self.dataCountEl = document.getElementById('requestsCount');
        self.errorCountEl = document.getElementById('errorCount');
        self.lastEventEl = document.getElementById('lastEvent');
        self.watcherStateEl = document.getElementById('watcherState');
        self.serverStateEl = document.getElementById('serverState');
        self.startButtonEl = document.getElementById('startButton');
        self.stopButtonEl = document.getElementById('stopButton');
        self.serverButtonEl = document.getElementById('serverButton');
        // Setup connection check
        self.checkConnection();
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
    }

    updateSettings(path, url, commander, apiKey) {
        this.path = path;
        this.url = url;
        this.commander = commander;
        this.apiKey = apiKey;
        // Restart the watcher if it is active when settings are changed
        if (this.isActive()) {
            this.stopWatcher();
            this.startWatcher();
        }
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
        this.stopConnectionCheck();
        // TODO: Transmit event to server to stop tracking. Also add this when quit app happens
    }

    checkConnection() {
        this.tracker.setConnectionState('Connecting');
        this.updateServerUi();
        this.transmitter.checkLatency().then((response) => {
            this.tracker.setConnectionState(`Latency: ${response.latency}ms`);
            this.updateServerUi();
            let self = this;
            if (!this.connectionCheck) {
                this.connectionCheck = setInterval(() => {
                    self.checkConnection();
                }, 5000);
            }
        }).catch((error) => {
            this.tracker.setConnectionState(error);
            this.tracker.addErrorCount(1);
            this.updateServerUi();
        });
    }

    stopConnectionCheck() {
        if (this.connectionCheck) {
            clearInterval(this.connectionCheck);
            this.connectionCheck = null;
            this.tracker.setConnectionState('Disconnected');
            this.updateServerUi();
        }
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
        this.serverStateEl.innerText = this.tracker.getConnectionState();
        this.errorCountEl.innerText = this.tracker.getErrorCount();
    }

    updateWatcherUi() {
        if (this.tracker.getWatcherState()) {
            this.watcherStateEl.innerText = 'Active';
            this.startButtonEl.disabled = true;
            this.stopButtonEl.disabled = false;
        } else {
            this.watcherStateEl.innerText = 'Inactive';
            this.startButtonEl.disabled = false;
            this.stopButtonEl.disabled = true;
        }
    }

    isActive() {
        return this.tracker.getWatcherState();
    }
}
