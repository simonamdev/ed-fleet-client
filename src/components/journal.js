import fs from 'fs';
import path from 'path';
import process from 'process';
import JournalTracker from './journal/journal-tracker';
import JournalWatcher from './journal/journal-watcher';
import JournalTransmitter from './journal/journal-transmitter';

export default class Journal {
    constructor(directory, url, commander, apiKey) {
        this.directory = directory;
        this.url = url;
        this.commander = commander;
        this.apiKey = apiKey;
        this.settingsPath = path.join(
            process.resourcesPath,
            'settings.json'
        );
        this.tracker = new JournalTracker();
        this.watcher = new JournalWatcher(this.directory);
        this.transmitter = new JournalTransmitter(
            this.url,
            this.commander,
            this.apiKey
        );
        this.connectionCheck = null;
        this.setupDomReferences();
    }

    init() {
        let self = this;
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

    setupDomReferences() {
        // Setup references to DOM elements
        this.dataCountEl = document.getElementById('requestsCount');
        this.errorCountEl = document.getElementById('errorCount');
        this.lastEventEl = document.getElementById('lastEvent');
        this.watcherStateEl = document.getElementById('watcherState');
        this.serverStateEl = document.getElementById('serverState');
        // Buttons
        this.startButtonEl = document.getElementById('startButton');
        this.stopButtonEl = document.getElementById('stopButton');
        this.serverButtonEl = document.getElementById('serverButton');
        // Inputs
        this.pathInputEl = document.getElementById('pathInput');
        this.serverInputEl = document.getElementById('serverInput');
        this.cmdrInputEl = document.getElementById('cmdrInput');
        this.apiInputEl = document.getElementById('apiInput');
    }

    loadSettingsIfAvailable() {
        if (this.settingsAvailable()) {
            console.log(`Loading in settings from ${this.settingsPath}`);
            let settings = JSON.parse(fs.readFileSync(this.settingsPath));
            this.updateSettings(
                settings.path,
                settings.url,
                settings.commander,
                settings.apiKey
            );
        }
    }

    settingsAvailable() {
        return fs.existsSync(this.settingsPath);
    }

    updateSettings(path, url, commander, apiKey) {
        this.path = path;
        this.url = url;
        this.commander = commander;
        this.apiKey = apiKey;
        // Update the UI
        this.updateOptionsUi(
            {
                path: path,
                url: url,
                commander: commander,
                apiKey: apiKey
            }
        );
        // Restart the watcher if it is active when settings are changed
        if (this.isActive()) {
            this.stopWatcher();
            this.startWatcher();
        }
    }

    saveSettings() {
        let settings = {
            path: this.path,
            url: this.url,
            commander: this.commander,
            apiKey: this.apiKey
        };
        console.log('Writing settings to file');
        fs.writeFile(this.settingsPath, JSON.stringify(settings), (err) => {
            if (err) {
                console.error('Unable to save settings to file');
                console.error(err);
            }
        });
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
        }).catch((error) => {
            this.tracker.setConnectionState(error);
            this.tracker.addErrorCount(1);
            this.updateServerUi();
        });
        let self = this;
        if (!this.connectionCheck) {
            this.connectionCheck = setInterval(() => {
                self.checkConnection();
            }, 5000);
        }
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

    updateOptionsUi(settings) {
        this.pathInputEl.value = settings.path;
        this.serverInputEl.value = settings.url;
        this.cmdrInputEl.value = settings.commander;
        this.apiInputEl.value = settings.apiKey;
    }

    isActive() {
        return this.tracker.getWatcherState();
    }
}
