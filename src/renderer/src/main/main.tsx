import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { avatarStore } from "./avatarStore";
import type { SpeechRequest } from "./model";
import { speechWithIrodoriTTS } from "./speechWithIrodoriTTS";
import { speechWithVoicevox } from "./speechWithVoicevox";
import { speechWithWebSpeechAPI } from "./speechWithWebSpeechAPI";

// biome-ignore lint/suspicious/noExplicitAny: see: src/main/config.tts.ts Config
window.electron.ipcRenderer.on("main:update", async (_, config: any) => {
  avatarStore.publish({
    path: config.avatar.waiting.path,
    mirror: config.avatar.mirror,
    animation: config.avatar.animation,
  });
});

const speechQueue: SpeechRequest[] = [];

let isSpeaking = false;

// 音声再生リクエストをキューに追加
function enqueueSpeech(text: string, state: string, config: any) {
  speechQueue.push({ text, state, config, queuedAt: Date.now() });
  void processSpeechQueue();
}

// キューを順番に処理
async function processSpeechQueue() {
  if (isSpeaking) {
    return;
  }

  isSpeaking = true;

  try {
    while (speechQueue.length > 0) {
      const request = speechQueue.shift()!;

      // キューの最大待ち時間以上待っているリクエストは破棄
      if (
        request.config.tts.maxQueueWaitTime > 0 &&
        Date.now() - request.queuedAt >= request.config.tts.maxQueueWaitTime
      ) {
        continue;
      }

      try {
        await playSpeech(request);
      } catch (error) {
        console.error("Speech playback failed:", error);
      }
    }
  } finally {
    isSpeaking = false;

    // finally に入る直前に追加されたリクエストへの対策
    if (speechQueue.length > 0) {
      void processSpeechQueue();
    }
  }
}

// 音声を再生
async function playSpeech(request: SpeechRequest) {
  const { config } = request;

  if (config.tts.provider === "webSpeechAPI") {
    speechWithWebSpeechAPI(request);
    return;
  }

  if (config.tts.provider === "voicevox") {
    speechWithVoicevox(request);
    return;
  }

  if (config.tts.provider === "irodori-tts") {
    speechWithIrodoriTTS(request);
    return;
  }

  throw new Error(`Unsupported TTS provider: ${config.tts.provider}`);
}

// IPC
window.electron.ipcRenderer.on("main:say", async (_, text: string, state: string, config: any) => {
  enqueueSpeech(text, state, config);
});

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
