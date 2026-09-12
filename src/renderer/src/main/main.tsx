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

// biome-ignore lint/suspicious/noExplicitAny: see: src/main/config.tts.ts Config
window.electron.ipcRenderer.on("main:say", async (_, text: string, state: string, config: any) => {
  const waitingPath = config.avatar.waiting.path;
  const speakingPath = config.avatar.states.find((state_) => state_.key === state)?.path ?? waitingPath;

  if (config.tts.provider === "webSpeechAPI") {
    if (!("speechSynthesis" in window)) {
      console.error("TTS is not supported in this browser");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = config.tts.webSpeechAPI.lang;
    utterance.volume = config.tts.webSpeechAPI.volume;
    utterance.pitch = config.tts.webSpeechAPI.pitch;
    utterance.rate = config.tts.webSpeechAPI.rate;

    try {
      avatarStore.publish({
        path: speakingPath,
        mirror: config.avatar.mirror,
        animation: config.avatar.animation,
      });
      await new Promise((resolve) => {
        utterance.onend = resolve;
        window.speechSynthesis.speak(utterance);
      });
    } finally {
      avatarStore.publish({
        path: waitingPath,
        mirror: config.avatar.mirror,
        animation: config.avatar.animation,
      });
    }

    return;
  }

  if (config.tts.provider === "voicevox") {
    // 音声合成用クエリを作成
    config.tts.voicevox.baseURL.tr;

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

    // 音声を合成
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

    // WAV を Blob として取得
    const audioBlob = await synthesisResponse.blob();

    // ブラウザで再生
    const audioURL = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioURL);

    audio.volume = config.tts.voicevox.volume;

    try {
      avatarStore.publish({
        path: speakingPath,
        mirror: config.avatar.mirror,
        animation: config.avatar.animation,
      });
      await new Promise((resolve) => {
        audio.addEventListener("ended", resolve, { once: true });
        audio.play();
      });
    } finally {
      avatarStore.publish({
        path: waitingPath,
        mirror: config.avatar.mirror,
        animation: config.avatar.animation,
      });
      URL.revokeObjectURL(audioURL);
    }
  }
});

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
