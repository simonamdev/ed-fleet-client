import fs from 'fs';
import path from 'path';

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
        this.fileNames = fs.readdirSync(this.directory);
        this.currentFile = path.join(this.directory, this.getLastCreatedFileName());
        this.lastLine = null;
        this.watcher = null;
        this.init();
    }

    init() {
        if (!fs.lstatSync(this.directory).isDirectory()) {
            console.log(`Error: Path is not a directory: ${this.directory}`);
        } else {
            this.fileNames = fs.readdirSync(this.directory);
            console.log(`${this.fileNames.length} files found: \n${this.fileNames.join(',')}`)
        }
    }

    watch() {
        this.setupNewFile();
        this.watchFile();
    }

    setupNewFile() {
        if (this.newFileFound()) {
            this.currentFile = path.join(this.directory, this.getLastCreatedFileName());
        }
    }

    newFileFound() {
        // Check if a new file has been created
        let fileNames = fs.readdirSync(this.directory);
        let currentFileNames = this.fileNames.slice();
        // Compare sorted values
        fileNames.sort();
        currentFileNames.sort();
        return fileNames.join(',') !== currentFileNames.join(',');
    }

    getLastCreatedFileName() {
        let latestIndex = 0;
        let latestTime = new Date(0) ;
        for (let i = 0; i < this.fileNames.length; i++) {
            let fileName = this.fileNames[i];
            let fullPath = path.join(this.directory, fileName);
            let creationTime = fs.statSync(fullPath).ctime;
            console.log(`${fileName}: ${creationTime}`);
        }
        for (let i = 0; i < this.fileNames.length; i++) {
            let fileName = this.fileNames[i];
            let fullPath = path.join(this.directory, fileName);
            let creationTime = fs.statSync(fullPath).ctime;
            if (creationTime > latestTime) {
                latestTime = creationTime;
                latestIndex = i;
            }
        }
        return this.fileNames[latestIndex];
    }

    watchFile() {
        console.log(`Watching: ${this.currentFile}`);
        this.watcher = fs.watch(this.currentFile, (event, filename) => {
            if (filename) {
                console.log(`Event: ${event}`);
                const file = fs.readFileSync(this.currentFile);
                // console.log('File content at : ' + new Date() + ' is \n' + file);
                this.parseFileContents(file.toString());
                // Check for new file
                this.setupNewFile();
            } else {
                console.log('Filename not provided');
            }
        });
    }

    parseFileContents(data) {
        const lines = data.split('\n');
        // console.log(`Lines: ${lines.join(',')}`);
        // console.log(`Lines found: ${lines.length}`);
        const newLine = lines[lines.length - 1];
        if (newLine !== this.lastLine && newLine !== '') {
            this.lastLine = newLine;
            console.log(`New line: ${newLine}`);
        } else {
            console.log('No new line found');
        }
    }
}
