import os from 'os';
import fs from 'fs';
import path from 'path';

const settingIsInvalid = val => (val == null || val === '');

const defaultUrl = 'http://localhost:3000/';
const defaultPath = path.join(
    os.homedir(),
    'Saved Games',
    'Frontier Developments',
    'Elite Dangerous',
);

export default class Settings {
    constructor(filePath) {
        this.path = filePath || path.join(
            process.resourcesPath,
            'settings.json',
        );
        this.defaultUrl = defaultUrl;
        this.defaultPath = defaultPath;
        this.settings = {};
    }

    loadExistingSettings() {
        if (this.areAvailable()) {
            const settings = JSON.parse(fs.readFileSync(this.path));
            this.updateSettings(settings);
            console.log(`Loaded settings:\nPath: ${settings.path}\nURL: ${settings.url}\nCommander: ${settings.commander}\nAPI Key: ${settings.apiKey}`);
            return true;
        }
        console.error('Unable to load existing settings');
        return false;
    }

    saveSettings() {
        console.log('Writing settings to file');
        return new Promise((resolve, reject) => {
            fs.writeFile(this.path, JSON.stringify(this.settings), (err) => {
                if (err) {
                    // TODO: Setup proper notification on screen
                    console.error('Unable to save settings to file');
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    updateSettings(settings) {
        this.settings = settings;
        // Set defaults if not avaiable
        this.settings.path = this.settings.path || defaultPath;
        this.settings.url = this.settings.url || defaultUrl;
    }

    areAvailable() {
        return fs.existsSync(this.path);
    }

    settingsAreValid() {
        if (this.loadExistingSettings()) {
            return !settingIsInvalid(this.settings.path) &&
                !settingIsInvalid(this.settings.url) &&
                !settingIsInvalid(this.settings.commander) &&
                !settingIsInvalid(this.settings.apiKey);
        }
        return false;
    }
}
