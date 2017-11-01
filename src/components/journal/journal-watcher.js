import os from 'os';
import fs from 'fs';
import path from 'path';
import EventEmitter from 'events';
import { LogWatcher } from 'ed-logwatcher';

export default class JournalWatcher extends EventEmitter {
    constructor(tracker, directory) {
        super();
        this.tracker = tracker;
        this.directory = directory || path.join(
            os.homedir(),
            'Saved Games',
            'Frontier Developments',
            'Elite Dangerous'
        );
        this.watcher = null;
    }

    init() {
        console.log(`Initialising watcher for: ${this.directory}`);
        this.watcher = new LogWatcher(this.directory, 3);
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
            this.tracker.addLoadedEventsCount(obs.length);
            this.tracker.addRecentEvents(obs);
        });
    }

    stop() {
        this.watcher.stop();
        this.watcher = null;
    }

    onDataLoad() {
        this.emit('update');
    }
}
