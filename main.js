
try {
  require("electron-reload")(__dirname, {
    electron: require(`${__dirname}/node_modules/electron`)
  });
} catch (e) {
  // Ignore if not installed or in production
}

const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 360,
    height: 520,
    resizable: false
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
