import { avatarStore } from "./avatarStore";
import type { SpeechRequest } from "./model";

export async function speechWithWebSpeechAPI({ text, state, config }: SpeechRequest) {
  const waitingPath = config.avatar.waiting.path;
  const speakingPath = config.avatar.states.find((state_: any) => state_.key === state)?.path ?? waitingPath;

  if (!("speechSynthesis" in window)) {
    throw new Error("TTS is not supported in this browser");
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

    await new Promise<void>((resolve, reject) => {
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis failed: ${event.error}`));

      window.speechSynthesis.speak(utterance);
    });
  } finally {
    avatarStore.publish({
      path: waitingPath,
      mirror: config.avatar.mirror,
      animation: config.avatar.animation,
    });
  }
}
