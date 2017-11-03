import { app, BrowserWindow } from 'electron';
// import { autoUpdater } from "electron-updater";
// const log = require('electron-log');

// autoUpdater.logger = log;
// autoUpdater.logger.transports.file.level = "info";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  // return;
  app.quit();
}

function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process');
  const path = require('path');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function(command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function(args) {
    console.log('Running update');
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }
};

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = () => {
    // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

    // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

    // Open the DevTools.
  mainWindow.webContents.openDevTools();

   // Emitted when the window is closed.
  mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
    mainWindow = null;
  });
};
//
// // Updater stuff
// autoUpdater.on('checking-for-update', () => {
//     console.log('Checking for update');
//     log.info('Checking for update');
// });
//
// autoUpdater.on('update-available', (info) => {
//     console.log('Update available.');
//     log.info('Update available');
//
// })
// autoUpdater.on('update-not-available', (info) => {
//     console.log('Update not available.');
//     log.info('Upate not available');
//
// })
// autoUpdater.on('error', (err) => {
//     console.log('Error in auto-updater. ' + err);
//     log.info('Error in auto-updater. ' + err);
// })
// autoUpdater.on('download-progress', (progressObj) => {
//     let log_message = "Download speed: " + progressObj.bytesPerSecond;
//     log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
//     log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
//     console.log(log_message);
//     log.info(log_message);
// })
// autoUpdater.on('update-downloaded', (info) => {
//     console.log('Update downloaded');
//     log.info('Update downloaded');
// });

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    // autoUpdater.checkForUpdatesAndNotify();
    createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
