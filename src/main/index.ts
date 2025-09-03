import { electronApp, optimizer } from "@electron-toolkit/utils";
import { app, Menu, Tray } from "electron";
import path from "node:path";
import type { Config } from "./config";
import { ConfigStore } from "./configStore";
import { ConfigWindow } from "./configWindow";
import { MainWindow } from "./mainWindow";
import { MCPServer } from "./mcp";

const AppName = "yak-mcp";
const AppVersion = "1.0.0";

// タスクトレイ
let trayIcon: Tray | undefined;

// 音声出力用メインウィンドウ
const mainWindow = new MainWindow();

// MCPサーバー
const mcpServer = new MCPServer({
  name: AppName,
  version: AppVersion,
  onSay: (text: string, config: Config["tts"]) => mainWindow.say(text, config),
});

// 設定用ウィンドウ
const configWindow = new ConfigWindow({
  onUpdate: (config) => {
    configStore.save(config);
    mcpServer.start(config);
  },
});

// 設定の永続化ストア
const configStore = new ConfigStore();

// Electron アプリの準備完了
app.whenReady().then(() => {
  if (process.platform === "win32") {
    // Set app user model id for windows
    electronApp.setAppUserModelId(`com.github.thamaji.${AppName}`);
  }

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // タスクトレイアイコン
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "設定",
      type: "normal",
      enabled: true,
      click: () => {
        const config = configStore.load();
        configWindow.open(config);
      },
    },
    { label: "終了", role: "quit" },
  ]);
  trayIcon = new Tray(path.join(app.getAppPath(), "resources", "icon.ico"));
  trayIcon.setToolTip(AppName);
  trayIcon.setContextMenu(contextMenu);

  // Main Window
  // 音声通知を出すだけのヘッドレスウィンドウ
  mainWindow.open();

  const config = configStore.load();
  if (!config) {
    // 設定ファイルが存在していない場合、まずは設定ウィンドウを起動
    configWindow.open(undefined);
  } else {
    // MCPサーバー起動
    mcpServer.start(config);
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
