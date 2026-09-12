# yak-mcp

<p align="center">
  <img width="400" alt="yak-mcp" src="./yak-mcp.png" />
</p>

<p align="center">An MCP that turns coding agents into "yak (chatty)" companions.</p>

<p align="center">This is a typical voice-notifying MCP, but it also works with coding agents running inside a devcontainer.</p>

## Demo

https://github.com/user-attachments/assets/e9f086b2-13bf-4bf3-9ebc-5ec3d65538ad

https://github.com/user-attachments/assets/16c76517-de31-479b-834f-a9a3b00f484b

> Voice: VOICEVOX:ずんだもん

You can do things like this with just a GIF image.

## Installation

Download the installer for your platform (Windows or Linux) from the [Release Page](https://github.com/thamaji/yak-mcp/releases).

**Note for Linux users:** I do not have a Linux desktop environment, so I have not been able to test the Linux build. I have successfully built the Linux version, but I cannot verify that it works correctly. Thank you for your understanding.

**Note for macOS users:** I was unable to build a macOS installer in my environment. If you need one, please build it yourself by following the instructions in this repository. Thank you for your understanding.

## Setup

When you first launch the application, the settings screen will appear.

### MCP Server

* **Host:** Enter the IP address to bind the server to.

  * If you want to use it from a coding agent inside a devcontainer, `0.0.0.0` is recommended.
* **Port:** Specify an available port for the server.

### TTS (Text-to-Speech)

You can choose between the **Web Speech API** and **VOICEVOX**.

VOICEVOX requires the [VOICEVOX Engine](https://github.com/VOICEVOX/voicevox_engine) to be installed and running.

#### Web Speech API

* **Language:** Choose the language for speech output.
* **Volume:** Adjust the speaking volume.
* **Pitch:** Set the pitch (voice height).
* **Rate:** Set the reading speed.

#### VOICEVOX

* **Base URL:** Specify the base URL of the VOICEVOX Engine REST API. In a standard setup, use `http://localhost:50021`.
* **Speaker ID:** Specify the ID of the speaker you want to use. If the VOICEVOX Engine is running locally, you can retrieve the list of available speakers from `http://localhost:50021/speakers`.
* **Volume:** Adjust the speaking volume.
* **Pitch:** Set the pitch (voice height).
* **Rate:** Set the reading speed.

### Avatar

These settings control the avatar displayed as a desktop mascot.

yak-mcp infers an emotional state from the conversation and switches the avatar image accordingly.

You can add as many emotional states as you like.

* **Key:** Specify a unique key representing the emotional state. Keys must not be duplicated.
* **Description:** Enter hints to help the AI infer when this emotional state applies.
* **Image file:** Specify the avatar image file. Supported formats are PNG, GIF, JPEG, WebP, and SVG. The path must be absolute.

After saving your settings, the MCP server will start on the specified port.

From the next launch onward, the MCP server will automatically start when the application launches.

You can reopen the settings screen from the system tray whenever you want to change your configuration.

---

### Configuring Your Coding Agent

Add the following configuration to your coding agent to connect to the MCP server.

#### Codex

Add the following to `config.toml`:

```toml
[mcp_servers.yak]
url = "http://localhost:39442/mcp"
```

#### Claude Code

Add the following to `.mcp.json`:

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

* If you are using Docker Desktop and want to connect from a devcontainer, set the host to `host.docker.internal`.
* If you are connecting from a coding agent running locally, `localhost` works fine.
* Make sure the port number matches the one specified in the settings.

To allow unconditional access to this tool, enable the `yak.say` permission.

---

### Using `host.docker.internal` from WSL

You can use `host.docker.internal` from WSL just like you would from a devcontainer.

To do this, add `host.docker.internal` to `/etc/hosts` when WSL starts. This allows a coding agent running in WSL to connect to the MCP server running on the Windows host using the same hostname, `host.docker.internal`, as a devcontainer.

Create a shell script at any location. In this example, we will use `/usr/local/update-host.sh`.

```sh
#!/bin/bash
set -eu

WINDOWS_HOSTNAME="host.docker.internal"

ip_addr=$(ip route | awk '/default/ {print $3}')

sed -i "/[[:space:]]${WINDOWS_HOSTNAME}$/d" /etc/hosts
echo "${ip_addr} ${WINDOWS_HOSTNAME}" >> /etc/hosts
```

Then add the following configuration to `/etc/wsl.conf` to run the script when WSL starts:

```text
[boot]
systemd=true
command=/usr/local/update-host.sh
```

---

### Testing

Once the setup is complete, start your coding agent and try the following instruction:

```text
use yak.say to say "hello"
```

If the agent speaks, the setup is successful.

---

Enjoy using your noisy, talkative coding agent!

## For Developers

### Recommended IDE Setup

* [VSCode](https://code.visualstudio.com/)

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
# For Windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```
