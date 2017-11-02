import url from 'url';
import EventEmitter from 'events';

export default class JournalTransmitter {
    constructor(serverUrl) {
        this.url = serverUrl;
        this.latencyUrl = url.resolve(serverUrl, '/latency');
        this.eventsUrl = url.resolve(serverUrl, '/event');
    }

    checkLatency() {
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();
            request.open('GET', this.latencyUrl, true);

            request.onload = () => {
                if (request.status >= 200 && request.status < 400) {
                    // Success!
                    let response = JSON.parse(request.responseText);
                    let latency = Math.abs(new Date() - new Date(response.time));
                    resolve({ latency: latency });
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

    sendEvent(data) {
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();
            request.open('POST', this.eventsUrl, true);
            request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

            request.onload = () => {
                if (request.status >= 200 && request.status < 400) {
                    // Success!
                    let response = JSON.parse(request.responseText);
                    resolve(
                        {
                            success: response.success,
                            message: response.message
                        }
                    );
                } else {
                    // We reached our target server, but it returned an error
                    reject(`Error: ${request.responseText}, Code: ${request.status}`);
                }
            };

            request.onerror = () => {
                // There was a connection error of some sort
                reject('Event sending error');
            };

            request.send(JSON.stringify({ data }));
        });
    }
}
