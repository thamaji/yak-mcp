import { avatarStore } from "./avatarStore";
import type { SpeechRequest } from "./model";

export async function speechWithIrodoriTTS({ text, state, config }: SpeechRequest) {
  const waitingPath = config.avatar.waiting.path;
  const speakingPath = config.avatar.states.find((state_: any) => state_.key === state)?.path ?? waitingPath;

  const baseURL = config.tts.irodoritts.baseURL.replace(/\/+$/, "");

  // サーバーが現在受け付けているモデルIDを取得
  const healthResponse = await fetch(`${baseURL}/health`);

  if (!healthResponse.ok) {
    throw new Error("failed to get irodori-tts server status");
  }

  const health = await healthResponse.json();
  const model = health.model?.id;

  if (typeof model !== "string" || !model) {
    throw new Error("irodori-tts model ID was not found");
  }

  // 音声合成
  const response = await fetch(`${baseURL}/v1/audio/speech`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      input: text,
      voice: config.tts.irodoritts.voice ?? undefined,
      response_format: "wav",
      speed: config.tts.irodoritts.rate,
      irodori: {
        caption: config.tts.irodoritts.caption || undefined,
        no_ref: config.tts.irodoritts.voice === null ? true : undefined,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`irodori-tts synthesis failed: ${error}`);
  }

  // 音声再生
  const blob = await response.blob();
  const audioURL = URL.createObjectURL(blob);
  const audio = new Audio(audioURL);

  audio.volume = config.tts.irodoritts.volume;

  try {
    avatarStore.publish({
      path: speakingPath,
      mirror: config.avatar.mirror,
      animation: config.avatar.animation,
    });

    await new Promise<void>((resolve, reject) => {
      audio.addEventListener("ended", () => resolve(), { once: true });
      audio.addEventListener("error", () => reject(new Error("failed to play irodori-tts audio")), { once: true });

      audio.play().catch(reject);
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
