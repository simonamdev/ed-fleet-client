import fs from 'fs';
import path from 'path';
import Journal from './journal';
import Settings from './settings';

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
        this.settings = null;
        this.connectionCheck = null;
    }

    init() {
        this.settings = new Settings();
        if (this.settings.settingsAreValid()) {
            let settings = JSON.parse(fs.readFileSync(this.settingsPath));
            this.journal = new Journal(this.settings.settings);
            this.journal.init();
            this.subscribeToUiUpdates();
            this.updateButtonAvailability(true);
        } else {
            this.updateButtonAvailability(false);
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
            // Update journal settings
            this.settings.loadExistingSettings();
            this.journal.updateSettings(this.settings.settings);
            // Set label to active
            this.watcherStateEl.innerText = 'Active';
            // Switch button to active
            this.startButtonEl.classList.remove('is-success');
            this.startButtonEl.classList.add('is-danger');
            this.startButtonEl.innerText = 'Close Uplink';
            // Start tracking journal
            this.journal.start();
            // Start checking latency
            this.checkConnection();
        }
    }

    stop() {
        if (this.journal.isActive()) {
            // Set label to inactive
            this.watcherStateEl.innerText = 'Inactive';
            // Switch button to inactive
            this.startButtonEl.classList.add('is-success');
            this.startButtonEl.classList.remove('is-danger');
            this.startButtonEl.innerText = 'Open Uplink';
            // Stop checking the latency to the server
            this.stopConnectionCheck();
            // Disable the watcher
            this.journal.stop();
            this.active = false;
        }
    }

    isActive() {
        return this.active;
    }

    updateButtonAvailability(allowed) {
        if (allowed) {
            this.startButtonEl.classList.add('is-success');
            this.startButtonEl.classList.remove('is-danger');
            this.startButtonEl.innerText = 'Open Uplink';
        } else {
            this.startButtonEl.classList.remove('is-success');
            this.startButtonEl.classList.add('is-danger');
            this.startButtonEl.disabled = true;
            this.startButtonEl.innerText = 'Settings file unavailable or invalid - unable to open Uplink';
        }
    }

    subscribeToUiUpdates() {
        let self = this;
        self.journal.on('eventsUpdate', (state) => {
            self.updateEventsUi(state);
        });
        self.journal.on('serverUpdate', (state) => {
            self.updateServerUi(state);
        });
    }

    updateEventsUi(state) {
        this.dataCountEl.innerText = state.getEventCountTransmitted();
        this.lastEventEl.innerText = state.getLastEvent().event;
    }

    checkConnection() {
        this.serverStateEl.innerText = 'Connecting';
        this.journal.checkLatency();
        let self = this;
        if (!this.connectionCheck) {
            this.connectionCheck = setInterval(() => {
                self.journal.checkLatency();
            }, 5000);
        }
    }

    stopConnectionCheck() {
        if (this.connectionCheck) {
            clearInterval(this.connectionCheck);
            this.connectionCheck = null;
            this.serverStateEl.innerText = 'Disconnected';
        }
    }

    updateServerUi(state) {
        this.serverStateEl.innerText = state.getConnectionState();
        this.errorCountEl.innerText = state.getErrorCount();
    }

    settingsFileAvailable() {
        return fs.existsSync(settingsPath);
    }
}
