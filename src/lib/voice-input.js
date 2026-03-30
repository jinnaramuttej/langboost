const speechRecognitionLanguageMap = {
  English: "en-US",
  Spanish: "es-ES",
  French: "fr-FR",
  German: "de-DE",
  Japanese: "ja-JP",
  Italian: "it-IT",
  Portuguese: "pt-BR",
  Korean: "ko-KR",
  Chinese: "zh-CN",
};

function getRecognitionConstructor() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function isLocalHost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

function formatStartError(error) {
  const reason = error?.name || error?.message || "";

  if (reason === "NotAllowedError" || reason === "PermissionDeniedError") {
    return "Microphone permission is blocked. Allow access in the browser and try again.";
  }

  if (reason === "NotFoundError" || reason === "DevicesNotFoundError") {
    return "No microphone was detected on this device.";
  }

  if (reason === "NotReadableError" || reason === "TrackStartError") {
    return "The microphone is busy in another app. Close that app and try again.";
  }

  return "Microphone access failed. Check your browser permissions and device settings.";
}

function formatRecognitionError(errorCode) {
  switch (errorCode) {
    case "not-allowed":
    case "service-not-allowed":
      return "Voice input permission was denied by the browser.";
    case "audio-capture":
      return "The browser could not access your microphone.";
    case "network":
      return "Voice recognition could not reach the browser speech service.";
    case "no-speech":
      return "No speech was detected. Try speaking a little closer to the microphone.";
    case "language-not-supported":
      return "Voice recognition is not available for this language in this browser.";
    case "aborted":
      return "";
    default:
      return "Voice input failed. Try again.";
  }
}

export function getRecognitionLanguage(language) {
  return speechRecognitionLanguageMap[language] || language || "en-US";
}

export function stopVoiceInput(recognitionRef) {
  try {
    recognitionRef?.current?.stop?.();
  } catch {
    // Ignore stop errors from browsers that already ended the session.
  }
}

export async function startVoiceInput({
  language,
  recognitionRef,
  onStart,
  onResult,
  onError,
  onEnd,
}) {
  const SpeechRecognition = getRecognitionConstructor();

  if (!SpeechRecognition) {
    onError?.("Voice input is not supported in this browser.");
    return null;
  }

  if (!window.isSecureContext && !isLocalHost()) {
    onError?.("Voice input requires HTTPS or localhost in this browser.");
    return null;
  }

  stopVoiceInput(recognitionRef);

  const recognition = new SpeechRecognition();
  recognition.lang = getRecognitionLanguage(language);
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  recognition.onstart = () => {
    onStart?.();
  };

  recognition.onresult = (event) => {
    const transcript = event.results?.[0]?.[0]?.transcript?.trim() || "";
    if (transcript) {
      onResult?.(transcript);
    }
  };

  recognition.onerror = (event) => {
    const message = formatRecognitionError(event?.error);
    if (message) {
      onError?.(message);
    }
  };

  recognition.onend = () => {
    if (recognitionRef?.current === recognition) {
      recognitionRef.current = null;
    }
    onEnd?.();
  };

  recognitionRef.current = recognition;

  try {
    recognition.start();
    return recognition;
  } catch (error) {
    if (recognitionRef?.current === recognition) {
      recognitionRef.current = null;
    }
    onError?.(formatStartError(error));
    return null;
  }
}
