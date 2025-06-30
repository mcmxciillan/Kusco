import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
// If using Node.js < 18 for the main process, you might need a fetch polyfill
// import fetch from 'node-fetch';

// Use environment variable for Flask API base URL, with a default for convenience
const FLASK_API_BASE_URL = process.env.FLASK_API_BASE_URL ?? 'http://localhost:1993' // Changed port to 1993

interface FlaskApiRequestArgs {
  method: 'GET' | 'POST' // Add other methods like PUT, DELETE as needed
  path: string
  body?: Record<string, unknown>
  responseType?: 'json' | 'text' | 'stream' // Added 'stream'
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false, // Consider setting to true for enhanced security if possible
      contextIsolation: true // Default and recommended
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

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
  ipcMain.on('ping', () => console.log('weve caught the trigger ping from the frontend process.'))

  // Generic handler for Flask API requests
  ipcMain.handle('flask-api-request', async (_event, args: FlaskApiRequestArgs) => {
    const { method, path, body, responseType = 'json' } = args
    const url = `${FLASK_API_BASE_URL}${path}`

    try {
      const fetchOptions: RequestInit = {
        method: method,
        headers: {} as Record<string, string>
      }

      if (method === 'POST' && body) {
        ;(fetchOptions.headers as Record<string, string>)['Content-Type'] = 'application/json'
        fetchOptions.body = JSON.stringify(body)
      }
      console.log(url, fetchOptions)
      const response = await fetch(url, fetchOptions)
      if (!response.ok) {
        console.log(response)
        const errorText = await response.text()
        console.error(`[Main Process] Flask API Error::: (${response.status}): ${errorText}`)
        throw new Error(`API request failed with status ${response.status}: ${errorText}`)
      }
      console.log(responseType, path, response.body)
      if (responseType === 'json') {
        return await response.json()
      } else if (responseType === 'text') {
        return await response.text()
      } else if (responseType === 'stream' && path === 'chat' && response.body) {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        // Function to read the stream
        const readStream = async (): Promise<void> => {
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) {
                _event.sender.send('chat-stream-end')
                break
              }
              _event.sender.send('chat-stream-data', decoder.decode(value, { stream: true }))
            }
          } catch (streamError) {
            console.error('[Main Process] Stream reading error:', streamError)
            _event.sender.send(
              'chat-stream-error',
              streamError instanceof Error ? streamError.message : String(streamError)
            )
          }
        }
        readStream() // Start reading the stream asynchronously
        // For a streaming response, the handle might return immediately or after stream setup.
        // Since events are sent via _event.sender.send, we don't return stream data here.
        return { streamStarted: true } // Acknowledge stream initiation
      } else {
        // Default to JSON
        return await response.json()
      }
    } catch (error) {
      console.error('[Main Process] Error calling Flask API:::', error)
      // Ensure the error is serializable for IPC
      if (error instanceof Error) {
        throw new Error(error.message) // Send a simpler error message
      }
      throw new Error('An unknown error occurred while calling the Flask API')
    }
  })

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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
