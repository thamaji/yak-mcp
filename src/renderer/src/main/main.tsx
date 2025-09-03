// biome-ignore lint/suspicious/noExplicitAny: see: src/main/config.ts Config["tts"]
window.electron.ipcRenderer.on("main:say", (_, text: string, config: any) => {
  console.log(text);
  console.log(config);

  if (!("speechSynthesis" in window)) {
    console.error("TTS is not supported in this browser");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = config.lang;
  utterance.volume = config.volume;
  utterance.pitch = config.pitch;
  utterance.rate = config.rate;

  window.speechSynthesis.speak(utterance);
});
