import { app } from "electron";
import fs from "node:fs";
import path from "node:path";
import type { Config } from "./config";

export class ConfigStore {
  private dirPath: string;

  constructor() {
    this.dirPath = app.getPath("userData");
  }

  load(): Config | undefined {
    const filePath = path.join(this.dirPath, "config.json");
    if (!fs.existsSync(filePath)) {
      return undefined;
    }
    const text = fs.readFileSync(filePath, { encoding: "utf-8" });
    const config = JSON.parse(text);

    return config;
  }

  save(config: Config): void {
    if (!fs.existsSync(this.dirPath)) {
      fs.mkdirSync(this.dirPath, { recursive: true });
    }

    const filePath = path.join(this.dirPath, "config.json");
    const text = JSON.stringify(config, null, 2);
    fs.writeFileSync(filePath, text, { encoding: "utf-8" });
  }
}
