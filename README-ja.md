# yak-mcp

<p align="center">
  <img width="400" alt="yak-mcp" src="./yak-mcp.png" />
</p>

<p align="center">AIエージェントを「おしゃべりな」仲間に変えるMCP。</p>

<p align="center">これは典型的なデスクトップマスコット型の音声通知MCPですが、devcontainer内で実行されるAIエージェントとも連携できます。</p>

翻訳: [English](./README.md) | [日本語](./README-ja.md)

## Demo

音が鳴ります。ミュートを解除して再生してみてください。

https://github.com/user-attachments/assets/e9f086b2-13bf-4bf3-9ebc-5ec3d65538ad

> Voice: VOICEVOX: ずんだもん

アバター画像は自由に変更できます。  
アニメーションGIFやAPNGを用意すれば、次のようなアバターも作成できます。

https://github.com/user-attachments/assets/1143fea3-f8cb-4317-8869-c5e23d893e63

> Voice: VOICEVOX: ずんだもん

## インストール

[Release](https://github.com/thamaji/yak-mcp/releases) からお使いのプラットフォーム用のインストーラーをダウンロードしてください。

**Linux ユーザーの方:** 私は Linux デスクトップ環境を持っていないため、Linux 向けの動作を確認できておりません。Linux 向けのビルドには成功しましたが、正しく動作するかは不明です。ご理解のほどよろしくお願いいたします。

**macOS ユーザーの方:** 私の環境では macOS 向けのビルドができませんでした。開発者向けの手順に従い、ご自身でのビルドをお試しください。ご理解のほどよろしくお願いいたします。

## セットアップ

はじめてアプリケーションを起動すると、設定画面が表示されます。  
必要に応じて設定を変更し、Save ボタンを押下すると MCP サーバーが起動します。

次回以降は、起動時に MCP サーバーが自動的に起動します。  
設定を変更したい場合は、システムトレイのアイコンからいつでも設定画面を表示できます。

### MCP Server

* **Host:** MCP サーバーのバインドアドレスを指定します。
  * devcontainer から利用する場合は `0.0.0.0` を推奨します。
* **Port:** MCP サーバーの待ち受けポート番号を指定します。
* **REST API:** 有効にすると MCP Server の他に REST API のエンドポイントも公開するようになります。エージェントスキルやその他のアプリケーションから yak-mcp の機能を利用できるようになります。

### TTS (Text-to-Speech)

組み込みの「Web Speech API」か、「VOICEVOX」を選択できます。

VOICEVOX を利用するには [VOICEVOX Engine](https://github.com/VOICEVOX/voicevox_engine) が実行されている必要があります。

#### Web Speech API

* **Language:** 使用する言語を選択します。
* **Volume:** 声の大きさを指定します。
* **Pitch:** 声の高さを指定します。
* **Rate:** 喋る速さを指定します。

#### VOICEVOX

* **Base URL:** VOICEVOX Engine が提供する REST API のエンドポイントを指定します。標準的なセットアップでは `http://localhost:50021` を指定してください。
* **Speaker ID:** 話者IDを指定します。標準的なセットアップの場合、`http://localhost:50021/speakers` にアクセスすると、話者の一覧や話者IDを確認できます。
* **Volume:** 声の大きさを指定します。
* **Pitch:** 声の高さを指定します。
* **Rate:** 喋る速さを指定します。

### Avatar

デスクトップマスコットとして表示されるアバターの動作を設定します。

* **Mirror:** アバター画像を左右反転する場合に有効にします。
* **Animation:** アバター画像に適用するアニメーションを選択します。
  * **None:** アニメーションしません。
  * **Sway:** 左右にゆらゆらと揺れます。
  * **Weight shift:** ゆっくりと左右に体重移動を繰り返します。
  * **Breathing:** 呼吸をするように上下に伸縮します。
  * **Float:** ふわふわと浮遊するように上下に移動します。
* **Opacity:** アバター画像の透明度を指定します。
* **Ignore mouse events:** 有効にするとマウスイベントが透過されます。アバター画像を移動したり、大きさを変えるときは無効にしてください。
* **Emotional states:** yak-mcp は AI が指定する感情状態により、アバターの画像を切り替えます。感情状態はいくらでも追加可能です。
  * **Key:** 感情状態を表す一意のキーを指定します。キーは重複してはなりません。
  * **Description:** AI がこの感情状態を選択するためのヒントとなる文章を入力します。
  * **Image file:** アバター画像のファイルパスを指定します。対応するフォーマットは PNG、GIF、JPEG、WebP、SVG です。絶対パスで指定してください。

---

### AI エージェントの設定

yak-mcp は MCP に対応した一般的な AI エージェントで利用できます。  
yak-mcp が提供するツールは `say` ツールのみです。

代表的な AI エージェント向けの設定方法は次の項目を参照してください。  
なお、Docker Desktop を使用しており devcontainer から yak-mcp を利用する場合は、`localhost` ではなく `host.docker.internal` を指定してください。

#### Codex

`~/.codex/config.toml` に次の設定を追加します。

```toml
[mcp_servers.yak]
url = "http://localhost:39442/mcp"
```

また、`say` ツールを常に承認する場合、次の設定を `~/.codex/config.toml` に追加してください。

```toml
[mcp_servers.yak.tools.say]
approval_mode = "approve"
```

#### Claude Code

`~/.claude.json` に次の設定を追加します。

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

また、`say` ツールを常に承認する場合、次の設定を `~/.claude/settings.json` に追加してください。

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

### (おまけ) WSL から `host.docker.internal` を利用するには

WSL 内の `/etc/hosts` に `host.docker.internal` を設定することで、WSL 内でも docker コンテナ内と同じように `host.docker.internal` で Windows ホストに接続できるようになります。

これを自動化するには次の手順を行います。

#### 1. 任意のパスにシェルスクリプトを用意します。（この例では `/user/local/update-hosts.sh`）

```sh
#!/bin/bash
set -eu

WINDOWS_HOSTNAME="host.docker.internal"

ip_addr=$(ip route | awk '/default/ {print $3}')

sed -i "/[[:space:]]${WINDOWS_HOSTNAME}$/d" /etc/hosts
echo "${ip_addr} ${WINDOWS_HOSTNAME}" >> /etc/hosts
```

#### 2. WSL の起動時にスクリプトが実行されるように `/etc/wsl.conf` に設定します

```text
[boot]
systemd=true
command=/usr/local/update-host.sh
```

---

### テスト

セットアップが完了したら、AI エージェントを起動して、次のチャットを送ってみてください。

```text
use yak.say to say "こんにちは"
```

yak-mcp が喋れば、セットアップは成功しています。

または、REST API が有効な場合は、次のようにテストできます。

```sh
curl -X POST http://host.docker.internal:39442/say -d '{"text": "こんにちは", "state":"neutral"}'
```

---

お喋りで騒がしい AI エージェントをお楽しみください！

## 開発者向け

### 推奨IDE

* [VSCode](https://code.visualstudio.com/)

### 開発手順

#### 依存関係のインストール

```sh
pnpm install
```

#### 開発サーバーの起動

```sh
pnpm dev
```

#### 本番向けビルド

```sh
# For Windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```
