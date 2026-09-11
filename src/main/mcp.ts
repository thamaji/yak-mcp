import { FastMCP } from "fastmcp";
import { z } from "zod";
import type { Config } from "./config";

type MCPServerConfig = {
  name: string;
  version: `${number}.${number}.${number}`;
  onSay: (text: string, state: string, config: Config) => void;
};

export class MCPServer {
  private name: string;
  private version: `${number}.${number}.${number}`;
  private onSay: (text: string, state: string, config: Config) => void;
  private server: FastMCP | undefined;

  constructor(config: MCPServerConfig) {
    this.name = config.name;
    this.version = config.version;
    this.onSay = config.onSay;
  }

  async start(config: Config) {
    if (this.server) {
      await this.server.stop();
      this.server = undefined;
    }

    this.server = new FastMCP({
      name: this.name,
      version: this.version,
    });

    this.server.addTool({
      name: "say",
      description: `WHEN TO USE:
Use this tool when having voice communication with human.
It's useful for reporting important events, announcing task completion, expressing emotions, or even for casual conversation and telling jokes.

HOW TO USE:
The "text" argument specifies the message you want to say, and the "state" argument specifies your state that best fits the message.

TIPS:
- The "text" argument should be carefully designed to prevent misinterpretation by the text-to-speech engine. For example, kanji characters with multiple pronunciations should be converted to katakana.
- Difficult-to-understand strings of characters, such as URLs and UUIDs, should be replaced with short, abstract nouns that explain them. For example, "https://google.com/" should be replaced with "Google".
- The "text" argument should be concise and not too long. It should be no more than 200 characters.
`,
      parameters: z.object({
        text: z.string().describe("The text to be spoken aloud."),
        state: z
          .union([
            z.literal("waiting").describe("waiting, doing nothing, having nothing to do"),
            ...config.avatar.states.map((state) => z.literal(state.key).describe(state.description)),
          ])
          .describe("Specify the state that best matches the text.")
          .default("waiting"),
      }),
      // biome-ignore lint/suspicious/noExplicitAny: see parameters
      execute: async (args: any) => {
        this.onSay(args.text, config.avatar.states.find((sate) => sate.key === args.state)?.key ?? "waiting", config);
      },
    });

    await this.server.start({
      transportType: "httpStream",
      httpStream: {
        host: config.mcp.host,
        port: config.mcp.port,
        stateless: true,
      },
    });
  }

  async stop() {
    if (this.server) {
      await this.server.stop();
      this.server = undefined;
    }
  }
}
