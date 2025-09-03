import { is } from "@electron-toolkit/utils";
import { app, BrowserWindow, ipcMain, shell } from "electron";
import path, { join } from "node:path";
import { DefaultConfig, type Config } from "./config";

export class ConfigWindow {
  private window: BrowserWindow | undefined;
  private onUpdateCallback: ((config: Config) => void) | undefined;

  constructor(config?: { onUpdate?: (config: Config) => void }) {
    this.onUpdateCallback = config?.onUpdate;
  }

  open(config: Config | undefined) {
    if (this.window && !this.window.isDestroyed()) {
      this.window.show();
      this.window.focus();
      this.window?.webContents.send("config:set", config || DefaultConfig, !config);
      return;
    }

    this.window = new BrowserWindow({
      width: 512,
      height: 634,
      resizable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      show: false,
      autoHideMenuBar: true,
      icon: path.join(app.getAppPath(), "resources", "icon.ico"),
      webPreferences: {
        preload: join(__dirname, "../preload/index.js"),
        sandbox: false,
      },
    });

    this.window.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url);
      return { action: "deny" };
    });

    if (is.dev && process.env.ELECTRON_RENDERER_URL) {
      this.window.loadURL(`${process.env.ELECTRON_RENDERER_URL}/config.html`);
    } else {
      this.window.loadFile(join(__dirname, "../renderer/config.html"));
    }

    this.window.on("close", () => {
      this.window = undefined;
    });

    this.window.on("ready-to-show", () => {
      this.window?.show();
      this.window?.focus();
    });

    ipcMain.on("config:ready", () => {
      this.window?.webContents.send("config:set", config || DefaultConfig, !config);
    });

    ipcMain.on("config:update", (_, config: Config) => {
      this.onUpdateCallback?.(config);
      this.window?.close();
    });
  }

  onUpdate(callback: (config: Config) => void): void {
    this.onUpdateCallback = callback;
  }
}
