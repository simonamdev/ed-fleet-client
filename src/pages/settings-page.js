import Settings from './components/settings';


const settingIsInvalid = val => (val == null || val === '');

class SettingsPage {
    constructor() {
        this.settings = new Settings();
        this.settings.loadExistingSettings();
    }

    init() {
        this.setupDomReferences();
        this.attachDomEvents();
        this.updateFields();
        this.updateSaveButton();
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
        const inputElements = [
            this.pathInputEl,
            this.serverInputEl,
            this.cmdrInputEl,
            this.apiInputEl,
        ];
        const self = this;
        inputElements.forEach((inputEl) => {
            self.validateOnContent(inputEl);
            inputEl.addEventListener('input', this.validateOnContent.bind(this));
        });
        // Attach event to save button
        self.saveButtonEl.addEventListener('click', () => {
            const settings = {
                path: self.pathInputEl.value,
                url: self.serverInputEl.value,
                commander: self.cmdrInputEl.value,
                apiKey: self.apiInputEl.value,
            };
            self.settings.updateSettings(settings);
            self.settings.saveSettings().then(() => {
                // Update contents of button for a short while
                this.saveButtonEl.innerText = 'Settings saved!';
                setInterval(() => {
                    this.saveButtonEl.innerText = 'Save Settings';
                }, 2500);
            }).catch((err) => {
                console.error(err);
            });
        });
    }

    validateOnContent(e) {
        const element = e.target || e;
        if (element.value && element.value.length) {
            element.classList.remove('is-danger');
        } else {
            element.classList.add('is-danger');
        }
        this.updateSaveButton();
    }

    // Disable save button if the settings are not all valid
    updateSaveButton() {
        if (!this.fieldsAreValid()) {
            this.saveButtonEl.disabled = true;
            this.saveButtonEl.innerText = 'Settings Invalid - cannot save to file';
            this.saveButtonEl.title = 'Some settings are invalid, fill them before starting the watcher';
        } else {
            this.saveButtonEl.disabled = false;
            this.saveButtonEl.innerText = 'Save Settings';
            this.saveButtonEl.title = '';
        }
    }

    fieldsAreValid() {
        const inputElements = [
            this.pathInputEl,
            this.serverInputEl,
            this.cmdrInputEl,
            this.apiInputEl,
        ];
        for (let i = 0; i < inputElements.length; i++) {
            if (settingIsInvalid(inputElements[i].value)) {
                return false;
            }
        }
        return true;
    }

    updateFields() {
        // Set defaults if they are unavailable
        const settings = this.settings.settings;
        this.pathInputEl.value = settings.path || this.settings.defaultPath;
        this.serverInputEl.value = settings.url || this.settings.defaultUrl;
        this.cmdrInputEl.value = settings.commander || '';
        this.apiInputEl.value = settings.apiKey || '';
        // Update validation styles
        const inputElements = [
            this.pathInputEl,
            this.serverInputEl,
            this.cmdrInputEl,
            this.apiInputEl,
        ];
        inputElements.forEach((inputEl) => {
            this.validateOnContent(inputEl);
        });
    }
}

console.log('Initialising Settings page');
const settingsPage = new SettingsPage();
settingsPage.init();
