const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200, height: 780, minWidth: 900, minHeight: 600,
    title: 'BlockBuddy', autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js') }
  });
  win.loadFile('src/index.html');
}

ipcMain.handle('export-pack', async (_e, pack) => {
  const { filePath, canceled } = await dialog.showSaveDialog({
    defaultPath: pack.name, filters: [{ name: 'Bedrock Resource Pack', extensions: ['mcpack'] }]
  });
  if (canceled || !filePath) return { ok: false };
  const zip = new AdmZip();
  for (const f of pack.files) zip.addFile(f.path, Buffer.from(f.b64, 'base64'));
  fs.writeFileSync(filePath, zip.toBuffer());
  return { ok: true, filePath };
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
