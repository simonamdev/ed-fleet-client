import { app, BrowserWindow, ipcMain } from 'electron';

// UPDATER STUFF
import { autoUpdater } from "electron-updater";
const log = require('electron-log');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
  // autoUpdater.quitAndInstall();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

// Updater stuff
autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update');
    log.info('Checking for update');
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('updateCheck');
    });
});

autoUpdater.on('update-available', (info) => {
    console.log('Update available.');
    log.info('Update available');
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('updateAvailable')
    });
});

autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available.');
    log.info('Upate not available');
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('updateNotAvailabe');
    });
});

autoUpdater.on('error', (err) => {
    console.log('Error in auto-updater. ' + err);
    log.info('Error in auto-updater. ' + err);
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('updateError', 'Error in auto-updater. ' + err);
    });
});

autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    console.log(log_message);
    log.info(log_message);
    mainWindow.webContents.send('updateProgress', log_message);
});

autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded');
    log.info('Update downloaded');
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('updateReady');
    });
});


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
    // app.quit();
  });
};


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    // autoUpdater.checkForUpdatesAndNotify();
    createWindow();
    mainWindow.webContents.on('did-finish-load', function() {
        mainWindow.webContents.send('ready');
    });
    console.log('Ready');
    // mainWindow.webContents.send('ready');
    autoUpdater.checkForUpdates();
});



// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    // autoUpdater.quitAndInstall();
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
