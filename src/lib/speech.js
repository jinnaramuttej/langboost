const languageCodes = {
  Spanish: "es-ES",
  French: "fr-FR",
  German: "de-DE",
  Japanese: "ja-JP",
  Italian: "it-IT",
  Portuguese: "pt-BR",
  Korean: "ko-KR",
  Chinese: "zh-CN",
  English: "en-US",
};

let cachedVoices = [];
let subscribed = false;
let currentAudio = null;

const getSynth = () => {
  if (typeof window === "undefined" || !window.speechSynthesis || typeof window.SpeechSynthesisUtterance === "undefined") {
    return null;
  }

  return window.speechSynthesis;
};

const isLocalWindows = () => {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  const isLocalHost = host === "localhost" || host === "127.0.0.1";
  const platform = window.navigator.userAgentData?.platform || window.navigator.platform || "";
  return isLocalHost && /win/i.test(platform);
};

const refreshVoices = (synth) => {
  try {
    const voices = synth.getVoices();
    if (voices.length > 0) {
      cachedVoices = voices;
    }
    return voices;
  } catch {
    return cachedVoices;
  }
};

const ensureSubscription = (synth) => {
  if (subscribed) return;
  subscribed = true;

  const handleVoicesChanged = () => {
    refreshVoices(synth);
  };

  synth.addEventListener("voiceschanged", handleVoicesChanged);
  refreshVoices(synth);
};

const pickVoice = (voices, lang) => {
  if (!voices?.length) return null;

  const exact = voices.find((voice) => voice.lang === lang);
  if (exact) return exact;

  const prefix = lang.split("-")[0]?.toLowerCase();
  return voices.find((voice) => voice.lang?.toLowerCase().startsWith(prefix)) || null;
};

const buildUtterance = (text, language) => {
  const lang = languageCodes[language] || language || "en-US";
  const voice = pickVoice(cachedVoices, lang);
  const utterance = new window.SpeechSynthesisUtterance(text);

  utterance.lang = voice?.lang || lang;
  utterance.voice = voice || null;
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;

  return utterance;
};

const stopCurrentAudio = () => {
  if (!currentAudio) return;
  currentAudio.pause();
  currentAudio.currentTime = 0;
  currentAudio = null;
};

const playBlob = async (blob) => {
  stopCurrentAudio();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  currentAudio = audio;

  audio.onended = () => {
    URL.revokeObjectURL(url);
    if (currentAudio === audio) currentAudio = null;
  };
  audio.onerror = () => {
    URL.revokeObjectURL(url);
    if (currentAudio === audio) currentAudio = null;
  };

  await audio.play();
};

const speakViaWindowsApi = async (text, language) => {
  try {
    const response = await fetch("/api/speak-local", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language }),
    });
    if (!response.ok) return false;
    const blob = await response.blob();
    await playBlob(blob);
    return true;
  } catch (error) {
    console.error("Windows speech fallback failed", error);
    return false;
  }
};

export function primeSpeechSynthesis() {
  const synth = getSynth();
  if (!synth) return false;

  ensureSubscription(synth);
  return true;
}

export function speakText(text, language = "English") {
  const trimmed = text?.trim();
  if (!trimmed) {
    return false;
  }

  if (isLocalWindows()) {
    void speakViaWindowsApi(trimmed, language);
    return true;
  }

  const synth = getSynth();
  if (!synth) {
    void speakViaWindowsApi(trimmed, language);
    return false;
  }

  ensureSubscription(synth);
  refreshVoices(synth);

  const utterance = buildUtterance(trimmed, language);
  let started = false;

  utterance.onstart = () => {
    started = true;
  };

  utterance.onerror = () => {
    void speakViaWindowsApi(trimmed, language);
  };

  try {
    if (synth.speaking || synth.pending) {
      synth.cancel();
    }
    synth.speak(utterance);
  } catch {
    void speakViaWindowsApi(trimmed, language);
    return false;
  }

  window.setTimeout(() => {
    if (started) return;
    void speakViaWindowsApi(trimmed, language);
  }, 250);

  return true;
}
