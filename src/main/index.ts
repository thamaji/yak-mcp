import { electronApp, optimizer } from "@electron-toolkit/utils";
import { app, Menu, net, protocol, Tray } from "electron";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { DefaultConfig, type Config } from "./config";
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
  onSay: (text: string, state: string, config: Config) => mainWindow.say(text, state, config),
});

// 設定用ウィンドウ
const configWindow = new ConfigWindow({
  onUpdate: (config) => {
    configStore.save(config);
    mcpServer.start(config);
    mainWindow.update(config);
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

  // renderer 向けにローカルファイルシステムのファイルを返すプロトコルを追加
  protocol.handle("localfs", async (request) => {
    process.platform === "win32";
    const url = new URL(request.url);
    const filePath = decodeURIComponent(url.pathname);
    return net.fetch(
      pathToFileURL(process.platform === "win32" ? filePath.replace(/^\/([A-Za-z]:)/, "$1") : filePath).href,
    );
  });

  // タスクトレイアイコン
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Restore",
      type: "normal",
      enabled: false,
      click: () => {
        mainWindow.restore();
      },
    },
    {
      label: "Reset position",
      type: "normal",
      enabled: true,
      click: () => {
        mainWindow.resetPosition();
      },
    },
    {
      label: "Config",
      type: "normal",
      enabled: true,
      click: () => {
        const config = configStore.load();
        configWindow.open(config);
      },
    },
    { label: "Quit", role: "quit" },
  ]);
  trayIcon = new Tray(path.join(app.getAppPath(), "resources", "icon.ico"));
  trayIcon.setToolTip(AppName);
  trayIcon.setContextMenu(contextMenu);

  mainWindow.onMinimize(() => {
    const item = contextMenu.items.find((item) => item.label === "Restore");
    if (!item) {
      return;
    }
    item.enabled = true;
  });
  mainWindow.onRestore(() => {
    const item = contextMenu.items.find((item) => item.label === "Restore");
    if (!item) {
      return;
    }
    item.enabled = false;
  });

  // 設定ファイルをロード
  const config = configStore.load();
  if (!config) {
    // 設定ファイルが存在していない場合、設定ウィンドウを開く
    configWindow.open(undefined);
  } else {
    // MCPサーバー起動
    mcpServer.start(config);
  }

  // Main Window
  // 音声通知とアバターを表示するためのウィンドウ
  mainWindow.onReady(() => {
    mainWindow.update(config ?? DefaultConfig);
  });

  // Main Window が閉じたら、Config Window も閉じる
  mainWindow.onClose(() => {
    configWindow.close();
  });

  // Main Window を開く
  mainWindow.open();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
