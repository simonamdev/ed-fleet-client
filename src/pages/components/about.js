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
        this.setupDomReferences();
        this.updateClientVersion();
        if (this.settings.loadExistingSettings() && this.settings.settings.url) {
            this.updateServerVersion();
        }
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
        this.serverVersionEl.innerText = 'Retrieving version';
        request.open('GET', url.resolve(this.settings.settings.url, '/version'), true);

        request.onload = () => {
            if (request.status >= 200 && request.status < 400) {
                // Success!
                const response = JSON.parse(request.responseText);
                this.serverVersionEl.innerText = response.server;
            } else {
                // We reached our target server, but it returned an error
                const errorStr = `Error: ${request.responseText}, Code: ${request.status}`;
                console.error(errorStr);
                this.serverVersionEl.innerText = ':(';
            }
        };

        request.onerror = () => {
            // There was a connection error of some sort
            console.error('Request error');
        };

        request.send();
    }
}
