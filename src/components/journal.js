import os from 'os';
import fs from 'fs';
import path from 'path';
import process from 'process';
import JournalTracker from './journal/journal-tracker';
import JournalWatcher from './journal/journal-watcher';
import JournalTransmitter from './journal/journal-transmitter';

/*
Settings:
1) path
2) url
3) commander
4) apiKey
*/

export default class Journal {
    constructor(settings) {
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
        this.tracker = new JournalTracker();
        this.watcher = new JournalWatcher(settings.path);
        this.transmitter = new JournalTransmitter(
            settings.url,
            settings.commander,
            settings.apiKey
        );
        // TODO: Move this to settings menu
        // Update the settings menu
        // this.updateOptionsUi(settings);
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
                self.updateEventsUi();
                let events = obs.slice();
                setImmediate(() => {
                    for (let i = 0; i < events.length; i++) {
                        let ev = events[i];
                        setImmediate(() => {
                            self.transmitter.sendEvent(ev).then((response) => {
                                // console.log(response);
                                // Update the events transmitted count
                                self.updateSuccessfulTransmissionCount(1);
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

    // TODO: Move to settings file

    updateSettings(settings) {
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

    // TODO: Move to settings file
    saveSettings() {
        console.log('Writing settings to file');
        fs.writeFile(this.settingsPath, JSON.stringify(this.settings), (err) => {
            if (err) {
                console.error('Unable to save settings to file');
                console.error(err);
            }
        });
    }

    setUrl(url) {
        this.url = url;
    }

    start() {
        console.log('Start Journal Watcher');
        this.tracker.setWatcherState(true);
        this.updateWatcherUi();
        this.watcher.init();
    }

    stop() {
        console.log('Stop Journal Watcher');
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

    updateRecentEvents(data) {
        this.tracker.addRecentEvents(data);
    }

    updateSuccessfulTransmissionCount(count) {
        this.tracker.addLoadedEventsCount(count);
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

    // Disable start watcher button if the settings are not all valid
    updateButtonAvailability() {
        if (!this.settingsAreValid()) {
            this.startButtonEl.disabled = true;
            this.startButtonEl.title = 'Some settings are invalid, fill them before starting the watcher';
        } else {
            this.startButtonEl.disabled = false;
            this.startButtonEl.title = '';
        }
    }

    // TODO: Move to settings file
    settingsAreValid() {
        return !this.settingIsInvalid(this.settings.path) &&
            !this.settingIsInvalid(this.settings.url) &&
            !this.settingIsInvalid(this.settings.commander) &&
            !this.settingIsInvalid(this.settings.apiKey);
    }

    // TODO: Move to settings file
    settingIsInvalid(val) {
        return (val == null || val === '');
    }

    isActive() {
        return this.tracker.getWatcherState();
    }
}
