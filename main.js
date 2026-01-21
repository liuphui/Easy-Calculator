
try {
  require("electron-reload")(__dirname, {
    electron: require(`${__dirname}/node_modules/electron`)
  });
} catch (e) {
  // Ignore if not installed or in production
}

const { app, ipcMain, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 360,
    height: 520,
    resizable: false,
    autoHideMenuBar: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.on("win:minimize", () => {
  BrowserWindow.getFocusedWindow()?.minimize()
});

ipcMain.on("win:maximize", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (!win) return;
  win.isMaximized() ? win.unmaximize() : win.maximize();
});

ipcMain.on("win:close", () => {
  BrowserWindow.getFocusedWindow()?.close()
});