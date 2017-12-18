import fs from 'fs';
import path from 'path';

export default class EventsWhitelist {
    constructor(whitelistPath) {
        this.whitelist = [];
        this.path = whitelistPath || path.join(
            process.resourcesPath,
            'whitelist.json'
        );
        this.loadWhitelist();
    }

    loadWhitelist() {
        // Hardcoded for now rather than file based
        const locationEvents = [
            'Location',
            'SupercruiseEntry',
            'SupercruiseExit',
            'Docked',
            'FSDJump'
        ];
        this.whitelist = locationEvents;
    }

    // loadWhitelist() {
    //     if (this.exists()) {
    //         const whitelist = JSON.parse(fs.readFileSync(this.path));
    //         this.whitelist = whitelist.events;
    //         console.log(`Loaded in whitelist events:\n${this.whitelist.join(', ')}`);
    //         return true;
    //     }
    //     console.error('Unable to load in whitelist');
    //     return false;
    // }
    //
    // fileExists() {
    //     return fs.existsSync(this.path);
    // }
}
