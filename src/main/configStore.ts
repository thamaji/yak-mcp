import { app } from "electron";
import fs from "node:fs";
import path from "node:path";
import { DefaultConfig, type Config } from "./config";

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

    try {
      const text = fs.readFileSync(filePath, { encoding: "utf-8" });
      const config = JSON.parse(text);

      if (config.mcp == null || typeof config.mcp !== "object" || Array.isArray(config.mcp)) {
        config.mcp = DefaultConfig.mcp;
      }

      if (
        config.mcp.host == null ||
        typeof config.mcp.host !== "string" ||
        !/^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])$/.test(
          config.mcp.host,
        )
      ) {
        config.mcp.host = DefaultConfig.mcp.host;
      }

      if (config.mcp.port == null || !Number.isFinite(config.mcp.port) || config.mcp.port <= 0) {
        config.mcp.port = DefaultConfig.mcp.port;
      }

      if (config.tts == null || typeof config.tts !== "object" || Array.isArray(config.tts)) {
        config.tts = DefaultConfig.tts;
      }

      if (
        config.tts.provider == null ||
        typeof config.tts.provider !== "string" ||
        !["webSpeechAPI", "voicevox"].includes(config.tts.provider)
      ) {
        config.tts.provider = DefaultConfig.tts.provider;
      }

      if (
        config.tts.webSpeechAPI == null ||
        typeof config.tts.webSpeechAPI !== "object" ||
        Array.isArray(config.tts.webSpeechAPI)
      ) {
        config.tts.webSpeechAPI = DefaultConfig.tts.webSpeechAPI;
      }

      if (
        config.tts.webSpeechAPI.lang == null ||
        typeof config.tts.webSpeechAPI.lang !== "string" ||
        ![
          "de-DE",
          "en-US",
          "en-GB",
          "es-ES",
          "es-US",
          "fr-FR",
          "hi-IN",
          "id-ID",
          "it-IT",
          "ja-JP",
          "ko-KR",
          "nl-NL",
          "pl-PL",
          "pt-BR",
          "ru-RU",
          "zh-CN",
          "zh-HK",
          "zh-TW",
        ].includes(config.tts.webSpeechAPI.lang)
      ) {
        config.tts.webSpeechAPI.lang = DefaultConfig.tts.webSpeechAPI.lang;
      }

      if (
        config.tts.webSpeechAPI.volume == null ||
        !Number.isFinite(config.tts.webSpeechAPI.volume) ||
        config.tts.webSpeechAPI.volume < 0 ||
        config.tts.webSpeechAPI.volume > 1
      ) {
        config.tts.webSpeechAPI.volume = DefaultConfig.tts.webSpeechAPI.volume;
      }

      if (
        config.tts.webSpeechAPI.pitch == null ||
        !Number.isFinite(config.tts.webSpeechAPI.pitch) ||
        config.tts.webSpeechAPI.pitch < 0 ||
        config.tts.webSpeechAPI.pitch > 2
      ) {
        config.tts.webSpeechAPI.pitch = DefaultConfig.tts.webSpeechAPI.pitch;
      }

      if (
        config.tts.webSpeechAPI.rate == null ||
        !Number.isFinite(config.tts.webSpeechAPI.rate) ||
        config.tts.webSpeechAPI.rate <= 0 ||
        config.tts.webSpeechAPI.rate > 2
      ) {
        config.tts.webSpeechAPI.rate = DefaultConfig.tts.webSpeechAPI.rate;
      }

      if (
        config.tts.voicevox == null ||
        typeof config.tts.voicevox !== "object" ||
        Array.isArray(config.tts.voicevox)
      ) {
        config.tts.voicevox = DefaultConfig.tts.voicevox;
      }

      if (
        config.tts.voicevox.baseURL == null ||
        typeof config.tts.voicevox.baseURL !== "string" ||
        config.tts.voicevox.baseURL === ""
      ) {
        config.tts.voicevox.baseURL = DefaultConfig.tts.voicevox.baseURL;
      }

      if (
        config.tts.voicevox.speakerID == null ||
        !Number.isFinite(config.tts.voicevox.speakerID) ||
        config.tts.voicevox.speakerID < 0
      ) {
        config.tts.voicevox.speakerID = DefaultConfig.tts.voicevox.speakerID;
      }

      if (
        config.tts.voicevox.volume == null ||
        !Number.isFinite(config.tts.voicevox.volume) ||
        config.tts.voicevox.volume < 0 ||
        config.tts.voicevox.volume > 1
      ) {
        config.tts.voicevox.volume = DefaultConfig.tts.voicevox.volume;
      }

      if (
        config.tts.voicevox.pitch == null ||
        !Number.isFinite(config.tts.voicevox.pitch) ||
        config.tts.voicevox.pitch < -1 ||
        config.tts.voicevox.pitch > 1
      ) {
        config.tts.voicevox.pitch = DefaultConfig.tts.voicevox.pitch;
      }

      if (
        config.tts.voicevox.rate == null ||
        !Number.isFinite(config.tts.voicevox.rate) ||
        config.tts.voicevox.rate <= 0 ||
        config.tts.voicevox.rate > 2
      ) {
        config.tts.voicevox.rate = DefaultConfig.tts.voicevox.rate;
      }

      if (config.avatar == null || typeof config.avatar !== "object" || Array.isArray(config.avatar)) {
        config.avatar = DefaultConfig.avatar;
      }

      if (config.avatar.mirror == null || typeof config.avatar.mirror !== "boolean") {
        config.avatar.mirror = DefaultConfig.avatar.mirror;
      }

      if (
        config.avatar.animation == null ||
        typeof config.avatar.animation !== "string" ||
        !["none", "sway", "weight-shift", "breathing", "float"].includes(config.avatar.animation)
      ) {
        config.avatar.animation = DefaultConfig.avatar.animation;
      }

      if (
        config.avatar.waiting == null ||
        typeof config.avatar.waiting !== "object" ||
        Array.isArray(config.avatar.waiting)
      ) {
        config.avatar.waiting = DefaultConfig.avatar.waiting;
      }

      if (
        config.avatar.waiting.path == null ||
        typeof config.avatar.waiting.path !== "string" ||
        config.avatar.waiting.path === ""
      ) {
        config.avatar.waiting.path = DefaultConfig.avatar.waiting.path;
      }

      if (config.avatar.states == null || typeof config.avatar !== "object" || !Array.isArray(config.avatar.states)) {
        config.avatar.states = DefaultConfig.avatar.states;
      }

      config.avatar.states = config.avatar.states
        .filter((state) => state.key != null && typeof state.key === "string" && state.key !== "")
        .map((state) => {
          if (state.description == null || typeof state.description !== "string") {
            state.description = "";
          }
          if (state.path == null || typeof state.path !== "string") {
            state.path = "";
          }
          return state;
        });

      return config;
    } catch {
      return DefaultConfig;
    }
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
