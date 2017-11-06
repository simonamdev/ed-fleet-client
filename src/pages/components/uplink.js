import fs from 'fs';
import path from 'path';
import Journal from './journal';

/*
Uplink screen contents:
> Watcher state
> Server connection state
> Fleet name
> Events Transmitted count
> Error count
> Last Event
> Watcher Button
*/

// TODO: Setup fleet name drawing on watcher successful connection

const settingsPath = path.join(
    process.resourcesPath,
    'settings.json'
);

export default class Uplink {
    constructor() {
        this.setupDomReferences();
        this.settingsPath = path.join(
            process.resourcesPath,
            'settings.json'
        );
        this.active = false;
        this.journal = null;
        this.connectionCheck = null;
    }

    init() {
        if (this.settingsFileAvailable()) {
            let settings = JSON.parse(fs.readFileSync(this.settingsPath));
            this.journal = new Journal(settings);
            this.journal.init();
            this.subscribeToUiUpdates();
        } else {
            console.error('Settings file unavailable');
            // TODO: Disable start button
        }
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
    }

    start() {
        if (!this.journal.isActive()) {
            this.active = true;
            // Switch button to active
            this.startButtonEl.classList.remove('is-success');
            this.startButtonEl.classList.add('is-danger');
            this.startButtonEl.innerText = 'Stop Watcher';

            // TODO: Subscribe to tracker events and update accordingly

            // this.tracker.setWatcherState(true);
            // this.updateWatcherUi();
            // this.watcher.init();

            // Start tracking journal
            this.journal.start();
        }
    }

    stop() {
        if (this.journal.isActive()) {
            // Switch button to inactive
            this.startButtonEl.classList.add('is-success');
            this.startButtonEl.classList.remove('is-danger');
            this.startButtonEl.innerText = 'Start Watcher';

            // this.tracker.setWatcherState(false);

            // this.updateWatcherUi();
            // this.watcher.stop();
            // this.stopConnectionCheck();
            this.active = false;
        }
    }

    isActive() {
        return this.active;
    }

    subscribeToUiUpdates() {
        this.journal.on('eventsUpdate', (state) => {
            this.dataCountEl.innerText = state.getEventCount();
            this.lastEventEl.innerText = state.getLastEvent().event;
        });
    }

    updateEventsUi(state) {

    }

    checkConnection() {
        // this.tracker.setConnectionState('Connecting');
        // this.updateServerUi();
        // this.transmitter.checkLatency().then((response) => {
        //     this.tracker.setConnectionState(`Latency: ${response.latency}ms`);
        //     this.updateServerUi();
        // }).catch((error) => {
        //     this.tracker.setConnectionState(error);
        //     this.tracker.addErrorCount(1);
        //     this.updateServerUi();
        // });
        let self = this;
        if (!this.connectionCheck) {
            this.connectionCheck = setInterval(() => {
                self.checkConnection();
            }, 5000);
        }
    }

    settingsFileAvailable() {
        return fs.existsSync(settingsPath);
    }
}
