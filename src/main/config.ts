export type Config = {
  mcp: {
    host: string;
    port: number;
  };
  tts: {
    lang: string;
    volume: number;
    pitch: number;
    rate: number;
  };
};

export const DefaultConfig: Config = {
  mcp: {
    host: "0.0.0.0",
    port: 8080,
  },
  tts: {
    lang: "ja-JP",
    volume: 1.0,
    pitch: 1.0,
    rate: 1.0,
  },
};
