import packageJson from '../../../../package.json';

export default class EddnService {
    constructor(uploaderId, debug) {
        this.url = 'https://eddn.edcd.io:4430/upload/';
        this.uploaderId = uploaderId;
        this.header = {
            uploaderID: this.uploaderId,
            softwareName: 'E:D Fleet Tracker',
            softwareVersion: packageJson.version.toString()
        };
        this.debug = debug;
        this.schemas = {
            journal: {
                production: 'https://eddn.edcd.io/schemas/journal/1',
                test: 'https://eddn.edcd.io/schemas/journal/1/test'
            }
        };
    }

    sendEvent(event) {
        // Only allow through the following events
        const allowedEvents = [
            'Docked',
            'FSDJump',
            'Scan',
            'Location'
        ];
        if (allowedEvents.indexOf(event.event) === -1) {
            return Promise.resolve();
        }
        let message = {
            $schemaRef: !this.debug ? this.schemas.journal.production : this.schemas.journal.test,
            header: this.header,
            message: {
                timestamp: event.timestamp,
                event: event.event,
                StarSystem: event.StarSystem,
                StarPos: event.StarPos
            }
        };
        return this.transmit(message);
    }

    transmit(data) {
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();
            request.open('POST', this.url, true);
            request.setRequestHeader('Content-Type', 'application/json; charset=utf8');
            // Set headers
            for (const key in this.header) {
                if (this.header.hasOwnProperty(key)) {
                    request.setRequestHeader(key, this.header[key]);
                }
            }

            request.onload = () => {
                if (request.status >= 200 && request.status < 400) {
                    // Should return "OK"
                    resolve(request.responseText);
                } else {
                    // We reached our target server, but it returned an error
                    reject(`Error: ${request.responseText}, Code: ${request.status}`);
                }
            };

            request.onerror = () => {
                // There was a connection error of some sort
                reject('Error sending event to EDDN');
            };

            request.send(JSON.stringify(data));
        });
    }
}
