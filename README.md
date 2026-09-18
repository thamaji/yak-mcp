# yak-mcp

<p align="center">
  <img width="400" alt="yak-mcp" src="./yak-mcp.png" />
</p>

<p align="center">An MCP that turns AI agents into "chatty" companions.</p>

<p align="center">This is a typical desktop mascot-style voice notification MCP, but it can also work with AI agents running inside devcontainers.</p>

Translations: [English](./README.md) | [日本語](./README-ja.md)

## Demo

This demo includes audio. Please unmute your device and play it.

https://github.com/user-attachments/assets/e9f086b2-13bf-4bf3-9ebc-5ec3d65538ad

> Voice: VOICEVOX: ずんだもん

You can freely customize the avatar image.
By preparing an animated GIF or APNG, you can create avatars like this:

https://github.com/user-attachments/assets/1143fea3-f8cb-4317-8869-c5e23d893e63

> Voice: VOICEVOX: ずんだもん

## Installation

Download the installer for your platform from the [Releases](https://github.com/thamaji/yak-mcp/releases) page.

**Linux users:** I do not have a Linux desktop environment, so I have not been able to verify that yak-mcp works correctly on Linux. I was able to build the Linux version successfully, but I cannot guarantee that it works as expected. Thank you for your understanding.

**macOS users:** I was unable to build the macOS version in my environment. Please follow the instructions for developers below and try building it yourself. Thank you for your understanding.

## Setup

When you launch the application for the first time, the settings window will be displayed.
Adjust the settings as needed, then click the **Save** button to start the MCP server.

From the next launch onward, the MCP server will start automatically.
If you want to change the settings, you can open the settings window at any time from the system tray icon.

### MCP Server

- **Host:** Specifies the address on which the MCP server listens.
  - `0.0.0.0` is recommended when accessing it from a devcontainer.
- **Port:** Specifies the port number on which the MCP server listens.
- **REST API:** When enabled, yak-mcp also exposes REST API endpoints in addition to the MCP server. This allows agent skills and other applications to use yak-mcp's functionality.

### TTS (Text-to-Speech)

You can choose between the built-in **Web Speech API** and **VOICEVOX**.

To use VOICEVOX, the [VOICEVOX Engine](https://github.com/VOICEVOX/voicevox_engine) must be running.

#### Web Speech API

- **Language:** Select the language to use.
- **Volume:** Specifies the voice volume.
- **Pitch:** Specifies the voice pitch.
- **Rate:** Specifies the speech rate.

#### VOICEVOX

- **Base URL:** Specifies the REST API endpoint provided by VOICEVOX Engine. For a standard setup, use `http://localhost:50021`.
- **Speaker ID:** Specifies the speaker ID. In a standard setup, access `http://localhost:50021/speakers` to view the list of speakers and their IDs.
- **Volume:** Specifies the voice volume.
- **Pitch:** Specifies the voice pitch.
- **Rate:** Specifies the speech rate.

### Avatar

Configure the behavior of the avatar displayed as a desktop mascot.

- **Mirror:** Enable this option to flip the avatar image horizontally.
- **Animation:** Select the animation to apply to the avatar image.
  - **None:** No animation.
  - **Sway:** Gently sways from side to side.
  - **Weight shift:** Slowly shifts its weight from side to side.
  - **Breathing:** Gently stretches and contracts as if breathing.
  - **Float:** Slowly moves up and down as if floating.
- **Opacity:** Specifies the opacity of the avatar image.
- **Ignore mouse events:** When enabled, mouse events pass through the avatar. Disable this option when moving or resizing the avatar window.
- **Emotional states:** yak-mcp switches the avatar image based on the emotional state specified by the AI. You can add as many emotional states as you like.
  - **Key:** Specifies a unique key identifying the emotional state. Keys must not be duplicated.
  - **Description:** Enter a description that helps the AI select this emotional state.
  - **Image file:** Specifies the file path to the avatar image. Supported formats are PNG, GIF, JPEG, WebP, and SVG. An absolute path is required.

---

### AI Agent Configuration

yak-mcp can be used with any MCP-compatible AI agent.
The only tool provided by yak-mcp is the `say` tool.

See the sections below for configuration examples for popular AI agents.
If you are using Docker Desktop and want to access yak-mcp from a devcontainer, use `host.docker.internal` instead of `localhost`.

#### Codex

Add the following configuration to `~/.codex/config.toml`:

```toml
[mcp_servers.yak]
url = "http://localhost:39442/mcp"
```

To always approve the `say` tool, also add the following configuration to `~/.codex/config.toml`:

```toml
[mcp_servers.yak.tools.say]
approval_mode = "approve"
```

#### Claude Code

Add the following configuration to `~/.claude.json`:

```json
{
  "mcpServers": {
    "yak": {
      "type": "http",
      "url": "http://localhost:39442/mcp"
    }
  }
}
```

To always allow the `say` tool, add the following configuration to `~/.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "mcp__yak__say"
    ]
  }
}
```

---

### (Optional) Using `host.docker.internal` from WSL

By adding `host.docker.internal` to `/etc/hosts` in WSL, you can connect to the Windows host from WSL using `host.docker.internal`, just as you would from a Docker container.

To automate this, follow these steps.

#### 1. Create a shell script at any path

In this example, the script is `/usr/local/update-hosts.sh`.

```sh
#!/bin/bash
set -eu

WINDOWS_HOSTNAME="host.docker.internal"

ip_addr=$(ip route | awk '/default/ {print $3}')

sed -i "/[[:space:]]${WINDOWS_HOSTNAME}$/d" /etc/hosts
echo "${ip_addr} ${WINDOWS_HOSTNAME}" >> /etc/hosts
```

#### 2. Configure WSL to run the script when WSL starts

Add the following to `/etc/wsl.conf`:

```text
[boot]
systemd=true
command=/usr/local/update-hosts.sh
```

---

### Testing

Once setup is complete, start your AI agent and send the following message:

```text
use yak.say to say "こんにちは"
```

If yak-mcp speaks, the setup is complete.

Alternatively, if the REST API is enabled, you can test it with:

```sh
curl -X POST http://host.docker.internal:39442/say -d '{"text": "こんにちは", "state":"neutral"}'
```

---

Enjoy your chatty and noisy AI agent!

## For Developers

### Recommended IDE

- [VSCode](https://code.visualstudio.com/)

### Development

#### Install dependencies

```sh
pnpm install
```

#### Start the development server

```sh
pnpm dev
```

#### Build for production

```sh
# For Windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```
