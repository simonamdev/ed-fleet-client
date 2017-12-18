export default class EddnService {
    constructor(uploaderId, debug) {
        this.url = 'https://eddn.edcd.io:4430/upload/';
        this.schemas = {
            commodity_schemas: {
                production: 'https://eddn.edcd.io/schemas/commodity/3',
                test: 'https://eddn.edcd.io/schemas/commodity/3/test'
            },
            shipyard: {
                production: 'https://eddn.edcd.io/schemas/shipyard/2',
                test: 'https://eddn.edcd.io/schemas/shipyard/2/test'
            },
            outfitting: {
                production: 'https://eddn.edcd.io/schemas/outfitting/2',
                test: 'https://eddn.edcd.io/schemas/outfitting/2/test'
            }
        };
    }

    sendEvent(message, timestamp) {
        let d = new Date();
        timestamp = timestamp || d.toIsoString();
        message.message.timestamp = timestamp;
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();
            request.open('POST', this.eventsUrl, true);
            request.setRequestHeader('Content-Type', 'application/json; charset=utf8');

            request.onload = () => {
                if (request.status >= 200 && request.status <
                    400) {
                    // Success!
                    let response = JSON.parse(request.responseText);
                    resolve(response);
                } else {
                    // We reached our target server, but it returned an error
                    reject(`Error: ${request.responseText}, Code: ${request.status}`);
                }
            };

            request.onerror = () => {
                // There was a connection error of some sort
                reject('Error sending event to EDDN');
            };

            request.send(JSON.stringify(message));
        });
    }
}
