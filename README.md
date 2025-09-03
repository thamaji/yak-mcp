# yak-mcp

<p align="center">
  <img width="400" alt="yak-mcp" src="./yak-mcp.png" />
</p>

<p align="center">An MCP that turns coding agents into "yak (chatty)" companions.</p>

## Installation

Download the installer for your platform (Windows, Linux) from the [Release Page](https://github.com/thamaji/yak-mcp/releases).

**Note for macOS users:** I was unable to build a macOS installer in my environment. If you need it, please build it yourself following the instructions in this repository. Thank you for your understanding.

## Setup

When you first launch the application, the settings screen will appear.

### MCP Server

- **Host:** Enter the IP address to bind the server.  
  - If you want to use it from a coding agent inside a devcontainer, setting it to `0.0.0.0` is recommended.  
- **Port:** Specify an available port for the server.

### TTS (Text-to-Speech)

- **Lang:** Choose the language for speech output.  
- **Volume:** Adjust the speaking volume.  
- **Pitch:** Set the pitch (voice height).  
- **Rate:** Set the reading speed.

After saving your settings, the MCP server will start on the specified port.  
From the next launch onwards, the MCP server will automatically start when the app launches.  
You can reopen the settings screen from the task tray whenever you want to change your configuration.

---

### Configuring Your Coding Agent

Add the following configuration to your coding agent to connect to the MCP server:

```json
"yak": {
  "type": "http",
  "url": "http://localhost:8080/mcp"
}
````

- If you are using Docker Desktop and want to connect from a devcontainer, set the host to `host.docker.internal`.
- If you are connecting from a local coding agent, `localhost` works fine.
- Make sure the port number matches the one specified in the settings.

To allow unconditional access to this tool, enable the `yak.say` permission.

---

### Testing

Once the setup is complete, start your coding agent and try the following instruction:

```
use yak, say "Hello."
```

If the agent speaks, the setup is successful.

---

Enjoy using your noisy, talkative coding agent!

## For Developers

### Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/)

### Project Setup

#### Install

```bash
pnpm install
```

#### Development

```bash
pnpm dev
```

#### Build

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```
