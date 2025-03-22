import { app, BrowserWindow, Menu } from "electron";

function createWindow() {
    const win = new BrowserWindow({
        width: 460,
        height: 760,
        webPreferences: {
            nodeIntegration: true,
        },
        resizable: true,
    });

    Menu.setApplicationMenu(null);
    win.loadURL('https://hayatpa.com/calculadora'); // Asegúrate de que Vite esté corriendo
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
