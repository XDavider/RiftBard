const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

function createWindow() {
  const iconPath = path.join(__dirname, 'riftbard.ico');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: "RiftBard - Caretaker's Vault",
    autoHideMenuBar: true
  });

  try {
    mainWindow.setIcon(iconPath);
  } catch (e) {
    // Ignore if not supported in dev
  }

  // Check if we are running in dev mode
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    // In dev mode, load the Vite dev server
    mainWindow.webContents.session.clearCache()
      .then(() => mainWindow.webContents.session.clearStorageData())
      .then(() => mainWindow.loadURL('http://localhost:5173'));
  } else {
    // In production, load the built React app
    mainWindow.loadFile(path.join(__dirname, 'frontend/dist/index.html'));
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function startBackend() {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  if (isDev) {
    // In dev mode, backend is started by concurrently in package.json
    console.log('Running in dev mode, backend is managed by concurrently.');
    return;
  }

  // In production, start the packaged backend
  // When packaged, extraFiles copies backend to resources/backend
  const backendDir = path.join(process.resourcesPath, 'backend');
  const serverPath = path.join(backendDir, 'server.js');
  
  // Ensure .env exists in packaged app from .env.example if not created yet
  const fs = require('fs');
  const envPath = path.join(backendDir, '.env');
  const envExamplePath = path.join(backendDir, '.env.example');
  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    try {
      fs.copyFileSync(envExamplePath, envPath);
    } catch (e) {
      console.warn('Could not initialize template .env:', e);
    }
  }

  // Start the node process directly
  backendProcess = spawn('node', [serverPath], {
    cwd: backendDir,
    env: { ...process.env, NODE_ENV: 'production' }
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
}

app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Kill backend process when app is quitting
  if (backendProcess) {
    console.log('Killing backend process...');
    backendProcess.kill();
  }
});
