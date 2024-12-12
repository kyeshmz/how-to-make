import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'

import { Client, Message, Server } from 'node-osc'
const oscServer = new Server(3333, '0.0.0.0', () => {
  console.log('OSC Server is listening')
})

const oscClient = new Client('192.168.41.38', 54321)

function createWindow(): void {
  oscServer.on('listening', () => {
    console.log('OSC Server is listening.')
  })

  ipcMain.on('/reset', (event) => {
    console.log('/reset')
    oscClient.send(new Message('/reset'), () => {})
  })

  ipcMain.on('/step/1', (event, mouseX) => {
    console.log('/step/1', mouseX)
    const message = new Message('/step/1', mouseX)
    oscClient.send(message, () => {})
  })

  ipcMain.on('/step/2', (event, mouseX) => {
    console.log('/step/2', mouseX)

    const message = new Message('/step/2', mouseX)
    oscClient.send(message, () => {})
  })

  ipcMain.on('ping', () => {
    const message = new Message('/step/2', 100)
    oscClient.send(message, () => {})
  })

  oscServer.on('message', function (msg) {
    console.log(`Message: ${msg}`)
    const address = (msg as Array<string>).at(0)
    const message = (msg as Array<string>).at(1)
    console.log('message', message)
    // mainWindow.webContents.send('fortune', 1)
    if (address === '/fortune') {
      mainWindow.webContents.send('fortune', 'bbbbbb')
    }
  })

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false,

    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  mainWindow.setAspectRatio(16 / 9)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.openDevTools()

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
