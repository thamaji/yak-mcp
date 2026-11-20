import { avatarStore } from "./avatarStore";
import type { SpeechRequest } from "./model";

export async function speechWithVoicevox({ text, state, config }: SpeechRequest) {
  const waitingPath = config.avatar.waiting.path;
  const speakingPath = config.avatar.states.find((state_: any) => state_.key === state)?.path ?? waitingPath;

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

  try {
    avatarStore.publish({
      path: speakingPath,
      mirror: config.avatar.mirror,
      animation: config.avatar.animation,
    });

    await new Promise<void>((resolve, reject) => {
      audio.addEventListener("ended", () => resolve(), { once: true });
      audio.addEventListener("error", () => reject(new Error("VOICEVOX audio playback failed")), { once: true });

      void audio.play().catch(reject);
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
