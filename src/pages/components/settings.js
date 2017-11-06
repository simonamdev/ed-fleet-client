import fs from 'fs';
import path from 'path';

const settingIsInvalid = (val) => {
    return (val == null || val === '');
};

const validateOnContent = (e) => {
    let element = e.target || e;
    if (element.value && element.value.length) {
        element.classList.remove('is-danger');
    } else {
        element.classList.add('is-danger');
    }
};

export default class Settings {
    constructor(filePath) {
        this.path = filePath || path.join(
            process.resourcesPath,
            'settings.json'
        );
        this.settings = {};
    }

    init() {
        this.setupDomReferences();
        this.attachDomEvents();
        this.loadExistingSettings();
        this.updateSaveButton();
        this.updateFields();
    }

    setupDomReferences() {
        // Inputs
        this.pathInputEl = document.getElementById('pathInput');
        this.serverInputEl = document.getElementById('serverInput');
        this.cmdrInputEl = document.getElementById('cmdrInput');
        this.apiInputEl = document.getElementById('apiInput');
        // Buttons
        this.saveButtonEl = document.getElementById('settingsSave');
    }

    attachDomEvents() {
        // Attach validation events to input elements
        let inputElements = [
            this.pathInputEl,
            this.serverInputEl,
            this.cmdrInputEl,
            this.apiInputEl
        ];
        inputElements.forEach((inputEl) => {
            validateOnContent(inputEl);
            inputEl.addEventListener('input', validateOnContent);
        });
        // Attach event to save button
        this.saveButtonEl.addEventListener('click', () => {
            let settings = {
                path: this.pathInputEl.value,
                url: this.serverInputEl.value,
                commander: this.cmdrInputEl.value,
                apiKey: this.apiInputEl.value
            };
        });
    }

    loadExistingSettings() {
        let settings = JSON.parse(fs.readFileSync(this.path));
        this.updateSettings(settings);
    }

    saveSettings() {
        console.log('Writing settings to file');
        fs.writeFile(this.path, JSON.stringify(this.settings), (err) => {
            if (err) {
                // TODO: Setup proper notification on screen
                console.error('Unable to save settings to file');
                console.error(err);
            }
        });
    }

    updateSettings(settings) {
        this.settings = settings;
        // Set defaults if not avaiable
        this.settings.path = this.settings.path || path.join(
            os.homedir(),
            'Saved Games',
            'Frontier Developments',
            'Elite Dangerous'
        );;
        this.settings.url = this.settings.url || 'http://localhost:3000/';
        this.updateSaveButton();
    }

    // Disable save button if the settings are not all valid
    updateSaveButton() {
        if (!this.settingsAreValid()) {
            this.saveButtonEl.disabled = true;
            this.saveButtonEl.title = 'Some settings are invalid, fill them before starting the watcher';
        } else {
            this.saveButtonEl.disabled = false;
            this.saveButtonEl.title = '';
        }
    }

    updateFields() {
        this.pathInputEl.value = this.settings.path;
        this.serverInputEl.value = this.settings.url;
        this.cmdrInputEl.value = this.settings.commander;
        this.apiInputEl.value = this.settings.apiKey;
        // Update validation styles
        let inputElements = [
            this.pathInputEl,
            this.serverInputEl,
            this.cmdrInputEl,
            this.apiInputEl
        ];
        inputElements.forEach((inputEl) => {
            validateOnContent(inputEl);
        });
    }

    settingsAreValid() {
        return !settingIsInvalid(this.settings.path) &&
            !settingIsInvalid(this.settings.url) &&
            !settingIsInvalid(this.settings.commander) &&
            !settingIsInvalid(this.settings.apiKey);
    }
}
