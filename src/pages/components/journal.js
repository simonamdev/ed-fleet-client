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

const settingsPath = path.join(
    process.resourcesPath,
    'settings.json'
);

export default class Journal extends EventEmitter {
    constructor(settings, whitelist) {
        super();
        this.active = false;
        this.settings = settings;
        this.whitelist = whitelist;
    }

    init() {
        // Setup internal classes
        this.state = new JournalState();
        this.watcher = new JournalWatcher(this.settings.path);
        this.transmitter = new JournalTransmitter(
            this.settings.url,
            this.settings.commander,
            this.settings.apiKey
        );
        console.log('Initialising Journal Watcher');
        console.log(`Settings:\nPath: ${this.settings.path}\nUrl: ${this.settings.url}\nCMDR: ${this.settings.commander}\nAPI Key: ${this.settings.apiKey}`);
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
                        if (!self.onWhitelist(ev.event)) {
                            // console.log(`Event: ${ev.event} is not on the whitelist: ${this.whitelist}`);
                            continue;
                        }
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

    onWhitelist(event) {
        if (this.whitelist.length) {
            return this.whitelist.indexOf(event) >= 0;
        }
        return true;
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
            this.state.setConnectionState(`${response.latency}ms`);
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

    updateSettings(settings) {
        this.settings = settings;
    }

    isActive() {
        return this.active;
    }
}
