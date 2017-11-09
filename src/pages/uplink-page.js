import Uplink from './components/uplink';

// References to DOM elements
let startButton = document.getElementById('startButton');

// Global reference to journal to stop user from starting more than one
let uplink = new Uplink();
uplink.init();

// Attach event to button to start watcher
startButton.addEventListener('click', () => {
    if (uplink && !uplink.isActive()) {
        uplink.start();
    } else {
        uplink.stop();
    }
});
