import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 900,
    titleBarStyle: 'hiddenInset', // Adds native sleek mac titlebar
    vibrancy: 'under-window', // Slight vibrancy
    visualEffectState: 'active',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    // Force localhost during local testing
    win.loadURL('http://localhost:5173');
  } else {
    // Point to Vite's output in production
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
