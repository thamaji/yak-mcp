import { is } from "@electron-toolkit/utils";
import { BrowserWindow } from "electron";
import { join } from "node:path";
import type { Config } from "./config";

export class MainWindow {
  private window: BrowserWindow | undefined;

  open() {
    if (this.window && !this.window.isDestroyed()) {
      return;
    }

    this.window = new BrowserWindow({
      width: 1,
      height: 1,
      show: false,
      autoHideMenuBar: true,
      webPreferences: {
        preload: join(__dirname, "../preload/index.js"),
        sandbox: false,
      },
    });

    if (is.dev && process.env.ELECTRON_RENDERER_URL) {
      this.window.loadURL(`${process.env.ELECTRON_RENDERER_URL}/main.html`);
    } else {
      this.window.loadFile(join(__dirname, "../renderer/main.html"));
    }

    this.window.on("close", () => {
      this.window = undefined;
    });
  }

  say(text: string, config: Config["tts"]): void {
    this.window?.webContents.send("main:say", text, config);
  }
}
