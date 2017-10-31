import fs from 'fs';

/*
Basic Elite: Dangerous Journal Watching algorithm:
1. Given a directory:
2. Check directory exists and is a directory
Start loop:
    3. Check if new file has appeared in directory
    4. If true, choose that file
    5. If false, choose last modified file
    6. Watch for file changes
    7. For each file change:
        8. Perform whatever processing is required
*/

export default class JournalWatcher {
    constructor(directory) {
        this.directory = directory;
        this.lastLine = null;
    }

    init() {
        const file = fs.readFileSync(this.path);
        console.log(`Original file contnents amount: ${file.length}`);
    }

    watch(directory) {

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
