const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', { exportPack: p => ipcRenderer.invoke('export-pack', p) });
