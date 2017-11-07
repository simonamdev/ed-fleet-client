import packageJson from '../../../package.json';

// TODO: Version checks and drawing
// TODO: Setup server version check on watcher successful connection

export default class About {
    init() {
        this.setupDomReferences();
        this.updateClientVersion();
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

    }
}
