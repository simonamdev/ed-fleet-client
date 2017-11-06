import os from 'os';
import fs from 'fs';
import path from 'path';
import process from 'process';
import EventEmitter from 'events';
import JournalState from './journal/journal-state';
import JournalWatcher from './journal/journal-watcher';
import JournalTransmitter from './journal/journal-transmitter';

/*
Settings:
1) path
2) url
3) commander
4) apiKey
*/

export default class Journal extends EventEmitter {
    constructor(settings) {
        super();
        this.active = false;
        this.settings = settings;
        // Setup defaults
        this.settings.path = settings ? settings.path : path.join(
            os.homedir(),
            'Saved Games',
            'Frontier Developments',
            'Elite Dangerous'
        );
        this.settings.url = settings.url || 'http://localhost:3000/';
        // Setup internal classes
        this.state = new JournalState();
        this.watcher = new JournalWatcher(settings.path);
        this.transmitter = new JournalTransmitter(
            settings.url,
            settings.commander,
            settings.apiKey
        );
    }

    init() {
        console.log('Initialising Journal Watcher');
        let self = this;
        // Setup connection check
        // self.checkConnection();
        // Subscribe to watcher events
        self.watcher.on('watcherUpdate', (obs) => {
            // To avoid sending the whole file on startup, skip updating the state if
            // the number of lines is greater than say 10
            if (obs.length <= 10) {
                self.updateRecentEvents(obs);
                self.emit('eventsUpdate', this.state);
                let events = obs.slice();
                setImmediate(() => {
                    for (let i = 0; i < events.length; i++) {
                        let ev = events[i];
                        setImmediate(() => {
                            self.transmitter.sendEvent(ev).then((response) => {
                                // console.log(response);
                                // Update the events transmitted count
                                this.state.addEventTransmittedCount(1);
                                self.emit('eventsUpdate', this.state);
                            }).catch((err) => {
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

    loadSettingsIfAvailable() {
        if (this.settingsAvailable()) {
            console.log(`Loading in settings from ${this.settingsPath}`);
            let settings = JSON.parse(fs.readFileSync(this.settingsPath));
            this.updateSettings(settings);
        }
    }

    // UPDATE THIS TO GET DATA FROM FILE ONLY
    updateSettingsFromFile() {
        this.settings = settings;
        // Update the UI
        this.updateOptionsUi(settings);
        this.updateButtonAvailability();
        // Restart the watcher if it is active when settings are changed
        if (this.isActive()) {
            this.stopWatcher();
            this.startWatcher();
        }
    }

    start() {
        console.log('Starting Journal Watcher');
        this.watcher.init();
        this.active = true;
    }

    stop() {
        console.log('Stopping Journal Watcher');
        this.watcher.stop();
        this.active = false;
        // TODO: Transmit event to server to stop tracking. Also add this when quit app happens
    }

    checkLatency() {
        this.transmitter.checkLatency().then((response) => {
            this.state.setConnectionState(`Latency: ${response.latency}ms`);
            this.emit('serverUpdate', this.state);
        }).catch((error) => {
            this.state.setConnectionState('Request Error');
            this.state.addErrorCount(1);
            this.emit('serverUpdate', this.state);
        });
    }

    updateRecentEvents(data) {
        this.state.addRecentEvents(data);
    }

    isActive() {
        return this.active;
    }
}
