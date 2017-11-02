export default class JournalTracker {
    constructor() {
        this.active = false;
        this.lastLatencyEvent = {};
        this.eventsLoaded = 0;
        this.lastEvent = null;
        this.eventsTransmitted = 0;
        this.recentEvents = [];
        this.recentEventLimit = 5; // TODO: make this configurable
        this.connectionState = '';
    }

    addLoadedEventsCount(count) {
        this.eventsLoaded += count;
    }

    getEventCount() {
        return this.eventsLoaded;
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

    setWatcherState(state) {
        this.active = state;
    }

    getWatcherState() {
        return this.active;
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
}
