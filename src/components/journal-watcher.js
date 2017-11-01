import os from 'os';
import fs from 'fs';
import path from 'path';
import { LogWatcher } from 'ed-logwatcher';

export default class JournalWatcher {
    constructor(directory) {
        this.directory = directory || path.join(
            os.homedir(),
            'Saved Games',
            'Frontier Developments',
            'Elite Dangerous'
        );
        this.watcher = new LogWatcher(this.directory, 3);
        this.linesLoaded = 0;
        this.lastEvent = '';
    }

    init() {
        console.log(`Initialising watcher for: ${this.directory}`);
        this.watcher.on('Started', () => {
            console.log('Started');
        });
        this.watcher.on('error', (err) => {
            this.watcher.stop();
            console.error(err.stack || err);
        });
        this.watcher.on('finished', () => {
            console.log('Finished');
            this.onDataLoad();
        });
        this.watcher.on('data', (obs) => {
            // console.log('Data: ');
            // console.log(obs);
            // console.log(obs.length);
            this.linesLoaded += obs.length;
            this.lastEvent = obs[obs.length - 1].event;
        });
    }

    onDataLoad() {
        document.getElementById('dataCount').innerText = this.linesLoaded.toString();
        document.getElementById('lastEvent').innerText = this.lastEvent;
    }
}
