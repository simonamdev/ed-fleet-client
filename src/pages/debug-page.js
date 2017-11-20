const addMessage = (text) => {
    const message = document.createElement('p');
    message.innerText = text;
    document.getElementById('debug').appendChild(message);
};

const sendTestEvent = () => {
    const request = new XMLHttpRequest();
    request.open('POST', 'http://localhost:3000/event', true);
    request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    request.setRequestHeader('API-KEY', 'test');

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
                event: 'TEST DEBUG EVENT',
                debug: true,
                starSystem: 'Test System'
            },
            commander: 'Test CMDR',
            timestamp: new Date(),
        },
    ));
};

document.getElementById('eventDebugButton').addEventListener('click', sendTestEvent);
