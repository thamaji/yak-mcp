import { is } from "@electron-toolkit/utils";
import { app, BrowserWindow, ipcMain, screen } from "electron";
import fs from "node:fs";
import path, { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Config } from "./config";

export class MainWindow {
  private window: BrowserWindow | undefined;
  private _onMinimize: (() => void) | undefined;
  private _onRestore: (() => void) | undefined;
  private _onClose: (() => void) | undefined;

  open() {
    if (this.window && !this.window.isDestroyed()) {
      return;
    }

    const userDataDir = app.getPath("userData");
    const boundsFilePath = path.join(userDataDir, "bounds.json");

    this.window = new BrowserWindow({
      width: 96,
      height: 96,
      minWidth: 48,
      minHeight: 48,
      resizable: true,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      frame: false,
      transparent: true,
      useContentSize: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      show: true,
      autoHideMenuBar: true,
      webPreferences: {
        preload: join(__dirname, "../preload/index.js"),
        sandbox: false,
        nodeIntegration: false,
        contextIsolation: true,
      },
    });
    this.window.setAspectRatio(1);
    this.window.setMenuBarVisibility(false);

    this.window.on("minimize", () => {
      this._onMinimize?.();
    });
    this.window.on("restore", () => {
      this._onRestore?.();
    });
    this.window.on("close", () => {
      this._onClose?.();
      this.window = undefined;
    });

    // 常に最前面に表示
    this.window.setAlwaysOnTop(true, "floating");
    this.window.moveTop();
    const interval = setInterval(() => {
      if (!this.window || this.window.isDestroyed()) {
        clearInterval(interval);
        return;
      }
      this.window.moveTop();
    }, 10000);

    // 移動、リサイズを記録
    let timer: NodeJS.Timeout | undefined;
    const recordBounds = () => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        if (!this.window) {
          return;
        }
        const bounds = this.window.getBounds();

        if (!fs.existsSync(userDataDir)) {
          fs.mkdirSync(userDataDir, { recursive: true });
        }
        const text = JSON.stringify(bounds);
        fs.writeFileSync(boundsFilePath, text, { encoding: "utf-8" });
      }, 1000);
    };
    this.window.on("move", () => {
      recordBounds();
    });
    this.window.on("resize", () => {
      recordBounds();
    });

    // 前回の位置に戻す
    try {
      const text = fs.readFileSync(boundsFilePath, { encoding: "utf-8" });
      const bounds = JSON.parse(text);
      if (bounds) {
        this.window.setBounds(bounds);
      } else {
        this.resetPosition();
      }
    } catch {
      this.resetPosition();
    }

    // リソースをロード
    if (is.dev && process.env.ELECTRON_RENDERER_URL) {
      this.window.loadURL(`${process.env.ELECTRON_RENDERER_URL}/main.html`);
    } else {
      this.window.loadFile(join(__dirname, "../renderer/main.html"));
    }
  }

  restore(): void {
    this.window?.restore();
  }

  resetPosition(): void {
    if (!this.window) {
      return;
    }

    const display = screen.getPrimaryDisplay();

    const [windowWidth, windowHeight] = this.window.getSize();

    this.window.setPosition(
      display.workArea.x + Math.round((display.workArea.width - windowWidth) / 2),
      display.workArea.y + Math.round((display.workArea.height - windowHeight) / 2),
    );

    this.window.moveTop();
  }

  onMinimize(f: () => void): void {
    this._onMinimize = f;
  }

  onRestore(f: () => void): void {
    this._onRestore = f;
  }

  onClose(f: () => void): void {
    this._onClose = f;
  }

  onReady(f: () => void): void {
    ipcMain.on("main:ready", () => {
      f();
    });
  }

  update(config: Config): void {
    this.window?.webContents.send("main:update", {
      ...config,
      avatar: {
        ...config.avatar,
        waiting: {
          path: pathToFileURL(config.avatar.waiting.path).href.replace(/^file:/, "localfs:"),
        },
        states: config.avatar.states.map((state) => ({
          ...state,
          path: pathToFileURL(state.path).href.replace(/^file:/, "localfs:"),
        })),
      },
    });
  }

  say(text: string, state, config: Config): void {
    this.window?.webContents.send("main:say", text, state, {
      ...config,
      avatar: {
        ...config.avatar,
        waiting: {
          path: pathToFileURL(config.avatar.waiting.path).href.replace(/^file:/, "localfs:"),
        },
        states: config.avatar.states.map((state) => ({
          ...state,
          path: pathToFileURL(state.path).href.replace(/^file:/, "localfs:"),
        })),
      },
    });
  }
}
