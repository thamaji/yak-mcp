import { FastMCP } from "fastmcp";
import { z } from "zod";
import type { Config } from "./config";

type MCPServerConfig = {
  name: string;
  version: `${number}.${number}.${number}`;
  onSay: (text: string, config: Config["tts"]) => void;
};

export class MCPServer {
  private name: string;
  private version: `${number}.${number}.${number}`;
  private onSay: (text: string, config: Config["tts"]) => void;
  private server: FastMCP | undefined;

  constructor(config: MCPServerConfig) {
    this.name = config.name;
    this.version = config.version;
    this.onSay = config.onSay;
  }

  start(config: Config) {
    if (this.server) {
      this.server.stop();
      this.server = undefined;
    }

    this.server = new FastMCP({
      name: this.name,
      version: this.version,
    });

    this.server.addTool({
      name: "say",
      description: `WHEN TO USE:
Use this tool when the coding agent needs to speak directly to a human —
for reporting important events, announcing task completion, expressing emotions, or casually murmuring about less critical actions.

HOW TO USE:
- Provide the "text" parameter with the message to deliver.
- Choose the "volume" parameter according to the situation:
  - SuperShouting: Critical alerts, long-running task completion, or urgent reports.
  - Shouting: Celebrations of success or expressions of sadness over failures.
  - Normal: Routine updates on upcoming or ongoing work.
  - Whisper: Informal comments, minor updates, or unimportant side notes.

FEATURES:
- Allows the coding agent to convey not only information but also tone and emotion.
- Supports four distinct speaking styles to match the context.

LIMITATIONS:
- Does not process or interpret human speech; output only.
- Emotional nuance is limited to the predefined volume levels.
- Overuse of SuperShouting or Shouting may overwhelm the human listener.

TIPS:
- Reserve SuperShouting for truly critical or celebratory events to maintain its impact.
- Use Shouting strategically to highlight both positive and negative outcomes.
- Employ Normal for steady narration of workflow.
- Leverage Whisper for humor, side comments, or low-priority notes to keep interactions natural.
`,
      parameters: z.object({
        text: z.string().describe(`The text to be spoken aloud, provided in ${config.tts.lang}.`),
        volume: z
          .enum(["SuperShouting", "Shouting", "Normal", "Whisper"])
          .describe("The speaking volume level, ranging from very loud (SuperShouting) to very quiet (Whisper)."),
      }),
      execute: async (args) => {
        const volume =
          args.volume === "SuperShouting"
            ? 1.0
            : args.volume === "Shouting"
              ? 0.9
              : args.volume === "Normal"
                ? 0.75
                : 0.5;
        this.onSay(args.text, { ...config.tts, volume: config.tts.volume * volume });
      },
    });

    this.server.start({
      transportType: "httpStream",
      httpStream: {
        host: config.mcp.host,
        port: config.mcp.port,
        stateless: true,
      },
    });
  }

  stop() {
    if (this.server) {
      this.server.stop();
      this.server = undefined;
    }
  }
}
