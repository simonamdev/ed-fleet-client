import url from 'url';
import EventEmitter from 'events';

export default class JournalTransmitter {
    constructor(serverUrl) {
        this.url = serverUrl;
        this.latencyUrl = url.resolve(serverUrl, '/latency');
        this.eventUrl = url.resolve(serverUrl, '/event');
    }

    checkLatency() {
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();
            request.open('GET', this.latencyUrl, true);

            request.onload = () => {
                if (request.status >= 200 && request.status < 400) {
                    // Success!
                    resolve(JSON.parse(request.responseText));
                } else {
                    // We reached our target server, but it returned an error
                    reject(`Error: ${request.responseText}, Code: ${request.status}`);
                }
            };

            request.onerror = () => {
                // There was a connection error of some sort
                reject('Latency request error');
            };

            request.send();
        });
    }

    sendEvent() {

    }
}
