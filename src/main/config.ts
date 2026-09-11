import { app } from "electron";
import path from "node:path";

export type Config = {
  mcp: {
    host: string;
    port: number;
  };
  tts: {
    provider: string;
    webSpeechAPI: {
      lang: string;
      volume: number;
      pitch: number;
      rate: number;
    };
    voicevox: {
      baseURL: string;
      speakerID: number;
      volume: number;
      pitch: number;
      rate: number;
    };
  };
  avatar: {
    mirror: boolean;
    waiting: {
      path: string;
    };
    states: {
      key: string;
      description: string;
      path: string;
    }[];
  };
};

export const DefaultConfig: Config = {
  mcp: {
    host: "0.0.0.0",
    port: 8080,
  },
  tts: {
    provider: "webSpeechAPI",
    webSpeechAPI: {
      lang: "ja-JP",
      volume: 1.0,
      pitch: 1.0,
      rate: 1.0,
    },
    voicevox: {
      baseURL: "http://localhost:50021",
      speakerID: 1,
      volume: 1.0,
      pitch: 0,
      rate: 1.0,
    },
  },
  avatar: {
    mirror: false,
    waiting: {
      path: path.join(app.getAppPath(), "resources", "waiting.gif"),
    },
    states: [
      {
        key: "talking",
        description: "normal, emotionless",
        path: path.join(app.getAppPath(), "resources", "talking.gif"),
      },
      {
        key: "happy",
        description: "happy, rejoicing",
        path: path.join(app.getAppPath(), "resources", "happy.gif"),
      },
      {
        key: "crying",
        description: "crying, sad",
        path: path.join(app.getAppPath(), "resources", "crying.gif"),
      },
      {
        key: "worried",
        description: "worried, difficult",
        path: path.join(app.getAppPath(), "resources", "worried.gif"),
      },
      {
        key: "troubled",
        description: "troubled, concerned",
        path: path.join(app.getAppPath(), "resources", "troubled.gif"),
      },
    ],
  },
};
