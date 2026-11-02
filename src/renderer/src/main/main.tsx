import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { avatarStore } from "./avatarStore";

// biome-ignore lint/suspicious/noExplicitAny: see: src/main/config.tts.ts Config
window.electron.ipcRenderer.on("main:update", async (_, config: any) => {
  avatarStore.publish({
    path: config.avatar.waiting.path,
    mirror: config.avatar.mirror,
    animation: config.avatar.animation,
  });
});

type SpeechRequest = {
  text: string;
  state: string;
  config: any;
  queuedAt: number;
};

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
async function playSpeech({ text, state, config }: SpeechRequest) {
  const waitingPath = config.avatar.waiting.path;
  const speakingPath = config.avatar.states.find((state_: any) => state_.key === state)?.path ?? waitingPath;

  const publishAvatar = (path: string) => {
    avatarStore.publish({ path, mirror: config.avatar.mirror, animation: config.avatar.animation });
  };

  try {
    if (config.tts.provider === "webSpeechAPI") {
      if (!("speechSynthesis" in window)) {
        throw new Error("TTS is not supported in this browser");
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = config.tts.webSpeechAPI.lang;
      utterance.volume = config.tts.webSpeechAPI.volume;
      utterance.pitch = config.tts.webSpeechAPI.pitch;
      utterance.rate = config.tts.webSpeechAPI.rate;

      publishAvatar(speakingPath);

      await new Promise<void>((resolve, reject) => {
        utterance.onend = () => resolve();
        utterance.onerror = (event) => reject(new Error(`Speech synthesis failed: ${event.error}`));

        window.speechSynthesis.speak(utterance);
      });

      return;
    }

    if (config.tts.provider === "voicevox") {
      const queryResponse = await fetch(
        `${config.tts.voicevox.baseURL}/audio_query?speaker=${config.tts.voicevox.speakerID}&text=${encodeURIComponent(text)}`,
        { method: "POST" },
      );

      if (!queryResponse.ok) {
        throw new Error(`VOICEVOX audio_query failed: ${queryResponse.status} ${await queryResponse.text()}`);
      }

      const query = await queryResponse.json();
      query.pitchScale = config.tts.voicevox.pitch;
      query.speedScale = config.tts.voicevox.rate;

      const synthesisResponse = await fetch(
        `${config.tts.voicevox.baseURL}/synthesis?speaker=${config.tts.voicevox.speakerID}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(query),
        },
      );

      if (!synthesisResponse.ok) {
        throw new Error(`VOICEVOX synthesis failed: ${synthesisResponse.status} ${await synthesisResponse.text()}`);
      }

      const audioBlob = await synthesisResponse.blob();
      const audioURL = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioURL);

      audio.volume = config.tts.voicevox.volume;

      publishAvatar(speakingPath);

      try {
        await new Promise<void>((resolve, reject) => {
          audio.addEventListener("ended", () => resolve(), { once: true });
          audio.addEventListener("error", () => reject(new Error("VOICEVOX audio playback failed")), { once: true });

          void audio.play().catch(reject);
        });
      } finally {
        URL.revokeObjectURL(audioURL);
      }

      return;
    }

    throw new Error(`Unsupported TTS provider: ${config.tts.provider}`);
  } finally {
    publishAvatar(waitingPath);
  }
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
