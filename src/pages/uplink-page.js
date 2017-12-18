import Uplink from './components/uplink';
import EventsWhitelist from './components/events-whitelist';

// References to DOM elements
let startButton = document.getElementById('startButton');

// Setup events whitelist for the uplink
let eventsWhitelistLoader = new EventsWhitelist();
const events = eventsWhitelistLoader.whitelist.slice();

// Global reference to journal to stop user from starting more than one
let uplink = new Uplink(events);
uplink.init();

// Attach event to button to start watcher
startButton.addEventListener('click', () => {
    if (uplink && !uplink.isActive()) {
        uplink.start();
    } else {
        uplink.stop();
    }
});
