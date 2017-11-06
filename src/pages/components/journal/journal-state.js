export default class JournalState {
    constructor() {
        this.lastEvent = null;
        this.recentEvents = [];
        this.recentEventLimit = 5; // TODO: make this configurable
        this.connectionState = '';
        this.eventsTransmitted = 0;
        this.errorCount = 0;
    }

    addRecentEvents(events) {
        if (events.length === this.recentEventLimit) {
            this.recentEvents = events.slice();
        } else {
            let newRecentEvents = this.recentEvents.concat(events.slice());
            // Remove events from the front till we are at our limit
            while (newRecentEvents.length > this.recentEventLimit) {
                newRecentEvents.shift();
            }
            this.recentEvents = newRecentEvents;
        }
    }

    getRecentEvents() {
        return this.recentEvents;
    }

    getLastEvent() {
        return this.recentEvents[this.recentEvents.length - 1];
    }

    getEventCountTransmitted() {
        return this.eventsTransmitted;
    }

    addEventTransmittedCount(count) {
        this.eventsTransmitted += count;
    }

    setConnectionState(state) {
        this.connectionState = state;
    }

    getConnectionState() {
        return this.connectionState;
    }

    addErrorCount(count) {
        this.errorCount += count;
    }

    getErrorCount() {
        return this.errorCount;
    }
}
