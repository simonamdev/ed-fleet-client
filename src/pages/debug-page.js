import url from 'url';
import Settings from './components/settings';

const settings = new Settings();
settings.loadExistingSettings();

const addMessage = (text) => {
    const message = document.createElement('p');
    message.innerText = text;
    document.getElementById('debug').appendChild(message);
};

const sendTestEvent = () => {
    console.log('Sending test event');
    const request = new XMLHttpRequest();
    request.open('POST', url.resolve(settings.settings.url, '/event'), true);
    request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    request.setRequestHeader('API-KEY', settings.settings.apiKey);

    request.onload = () => {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            const response = JSON.parse(request.responseText);
            addMessage(JSON.stringify(response.data));
        } else {
            // We reached our target server, but it returned an error
            console.error(`Error: ${request.responseText}, Code: ${request.status}`);
            addMessage(`Error: ${request.responseText}, Code: ${request.status}`);
        }
    };

    request.onerror = () => {
        // There was a connection error of some sort
        console.error('Event sending error');
        addMessage('Error sending debug event');
    };

    request.send(JSON.stringify(
        {
            data: {
                event: 'debug event',
                debug: true,
            },
            commander: settings.settings.commander,
            timestamp: new Date(),
        },
    ));
};

const message = document.createElement('p');
message.innerText = 'Starting debug event transmission';
document.getElementById('debug').appendChild(message);
setInterval(sendTestEvent, 2000);
