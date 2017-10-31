import fs from 'fs';

export default class JournalWatcher {
    constructor(path) {
        this.path = path;
        this.lastLine = null;
    }

    init() {
        const file = fs.readFileSync(this.path);
        console.log(`Original file contnents amount: ${file.length}`);
    }

    watchFile() {
        fs.watch(this.path, (event, filename) => {
            if (filename) {
                console.log(`Event: ${event}`);
                const file = fs.readFileSync(this.path);
                // console.log('File content at : ' + new Date() + ' is \n' + file);
                this.parseFileContents(file.toString());
            } else {
                console.log('Filename not provided');
            }
        });
    }

    parseFileContents(data) {
        const lines = data.split('\n');
        console.log(`Lines: ${lines.join(',')}`);
        console.log(`Lines found: ${lines.length}`);
        const newLine = lines[lines.length - 1];
        if (newLine !== this.lastLine) {
            this.lastLine = newLine;
            console.log(`New line: ${newLine}`);
        } else {
            console.log('No new line found');
        }
    }
}
