export default class JournalInterface {
    constructor(watcher) {
        this.watcher = watcher;
        this.tracker = watcher.tracker;
        this.init();
    }

    init() {
        let self = this;
        self.watcher.on('update', () => {
            self.updateEvents();
        });
    }

    updateEvents() {
        document.getElementById('dataCount').innerText = this.tracker.getEventCount();
        document.getElementById('lastEvent').innerText = this.tracker.getLastEvent().event;
    }
}
