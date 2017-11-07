import url from 'url';
import Settings from './settings';
import packageJson from '../../../package.json';

// TODO: Version checks and drawing
// TODO: Setup server version check on watcher successful connection

export default class About {
    constructor() {
        this.settings = new Settings();
    }

    init() {
        this.settings.loadExistingSettings();
        this.setupDomReferences();
        this.updateClientVersion();
        this.updateServerVersion();
    }

    setupDomReferences() {
        this.clientVersionEl = document.getElementById('clientVersion');
        this.serverVersionEl = document.getElementById('serverVersion');
    }

    // Draw the client version number taken from the package.json file
    updateClientVersion() {
        this.clientVersionEl.innerText = packageJson.version.toString();
    }

    updateServerVersion() {
        const request = new XMLHttpRequest();
        request.open('GET', url.resolve(this.settings.url, '/version'), true);

        request.onload = () => {
            if (request.status >= 200 && request.status < 400) {
                // Success!
                const response = JSON.parse(request.responseText);
                this.serverVersionEl.innerText = response.version;
            } else {
                // We reached our target server, but it returned an error
                console.error(`Error: ${request.responseText}, Code: ${request.status}`);
            }
        };

        request.onerror = () => {
            // There was a connection error of some sort
            console.error('Request error');
        };

        request.send();
    }
}
