const path = require('path')
const { app, BrowserWindow } = require('electron')
const server = require('./server')

const debug = /--debug/.test(process.argv[2])
if (process.mas) { app.setName('Open Monkey Mind') }

let win
async function createWindow () {
  makeSingleInstance()

  const windowOptions = {
    width: 1024,
    height: 768,
    title: app.getName(),
    webPreferences: {
      nodeIntegration: true
    }
  }

  if (process.platform === 'linux') {
    windowOptions.icon = path.join(__dirname, '/resources/assets/img/cogsci.png')
  }

  // Create the browser window.
  win = new BrowserWindow(windowOptions)
  await win.loadFile('index.html')

  if (debug) {
    win.webContents.openDevTools()
    win.maximize()
    require('devtron').install()
  }

  win.on('closed', () => {
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Make this app a single instance app.
//
// The main window will be restored and focused instead of a second window
// opened when a person attempts to launch a second instance.
//
// Returns true if the current version of the app should quit instead of
// launching.
function makeSingleInstance () {
  if (process.mas) { return }

  app.requestSingleInstanceLock()

  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) { win.restore() }
      win.focus()
    }
  })
}
