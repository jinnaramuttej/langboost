export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const preferredModels = [
  process.env.OLLAMA_MODEL,
  "phi3:latest",
  "gpt-oss:latest",
  "llama3.2:latest",
].filter(Boolean);

const supportedLanguageAliases = {
  english: "English",
  spanish: "Spanish",
  french: "French",
  german: "German",
  deutsch: "German",
  japanese: "Japanese",
  italian: "Italian",
  portuguese: "Portuguese",
  korean: "Korean",
};

const supportedLanguagePattern = Object.keys(supportedLanguageAliases).join("|");

const languageSignals = {
  English: ["hello", "hi", "thanks", "thank", "please", "how", "what", "can", "could", "help", "today", "assist"],
  Spanish: ["hola", "gracias", "por", "favor", "como", "puedo", "ayudar", "hoy", "que"],
  French: ["bonjour", "merci", "comment", "pouvez", "aider", "hui", "salut", "vous"],
  German: ["hallo", "danke", "bitte", "wie", "kann", "helfen", "heute", "ich", "sie"],
  Japanese: ["konnichiwa", "arigato", "ohayo"],
  Italian: ["ciao", "grazie", "come", "posso", "aiutarti", "oggi"],
  Portuguese: ["ola", "obrigado", "obrigada", "como", "voce", "posso", "ajudar"],
  Korean: ["annyeong", "gamsahamnida"],
};

const fallbackReplies = {
  English: "I can help with quick language questions. What would you like to practice?",
  Spanish: "Puedo ayudarte con preguntas rapidas de idioma. Que te gustaria practicar?",
  French: "Je peux vous aider avec des questions de langue rapides. Que voulez-vous pratiquer ?",
  German: "Ich kann bei kurzen Sprachfragen helfen. Was moechten Sie ueben?",
  Japanese: "\u8a00\u8a9e\u306e\u8cea\u554f\u3092\u77ed\u304f\u304a\u624b\u4f1d\u3044\u3067\u304d\u307e\u3059\u3002\u4f55\u3092\u7df4\u7fd2\u3057\u305f\u3044\u3067\u3059\u304b\uff1f",
  Italian: "Posso aiutarti con domande rapide di lingua. Cosa vuoi praticare?",
  Portuguese: "Posso ajudar com perguntas rapidas de idioma. O que voce quer praticar?",
  Korean: "\uc9e7\uc740 \uc5b8\uc5b4 \uc9c8\ubb38\uc744 \ub3c4\uc640\ub4dc\ub9b4 \uc218 \uc788\uc5b4\uc694. \ubb34\uc5c7\uc744 \uc5f0\uc2b5\ud558\uace0 \uc2f6\uc73c\uc138\uc694?",
};

function normalizeSupportedLanguage(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return supportedLanguageAliases[normalized] || null;
}

function extractExplicitLanguageRequest(messageContent) {
  if (typeof messageContent !== "string" || !messageContent.trim()) {
    return null;
  }

  const patterns = [
    new RegExp(`\\b(?:talk|speak|reply|respond|answer|write|chat|communicate)\\b[\\s\\S]{0,40}\\b(?:in|using)\\s+(${supportedLanguagePattern})\\b`, "i"),
    new RegExp(`\\b(?:switch\\s+to|use)\\s+(${supportedLanguagePattern})\\b`, "i"),
    new RegExp(`\\b(${supportedLanguagePattern})\\s+please\\b`, "i"),
  ];

  for (const pattern of patterns) {
    const match = messageContent.match(pattern);
    if (match?.[1]) {
      return normalizeSupportedLanguage(match[1]);
    }
  }

  return null;
}

function inferLanguageFromMessage(messageContent) {
  if (typeof messageContent !== "string" || !messageContent.trim()) {
    return null;
  }

  if (/[\u3040-\u30ff\u4e00-\u9fff]/.test(messageContent)) {
    return "Japanese";
  }

  if (/[\uac00-\ud7af]/.test(messageContent)) {
    return "Korean";
  }

  const normalized = messageContent.toLowerCase().replace(/[^a-z\s]/g, " ");
  const words = normalized.split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return null;
  }

  const scores = Object.entries(languageSignals).map(([language, signals]) => {
    let score = 0;
    for (const signal of signals) {
      if (words.includes(signal)) {
        score += 1;
      }
    }
    return { language, score };
  });

  scores.sort((a, b) => b.score - a.score);

  const best = scores[0];
  const second = scores[1];

  if (!best || best.score === 0) {
    return null;
  }

  if (second && best.score === second.score) {
    return null;
  }

  if (best.score >= 2) {
    return best.language;
  }

  if (best.score === 1 && words.length <= 3) {
    return best.language;
  }

  return null;
}

function isTranslationRequested(messageContent) {
  if (typeof messageContent !== "string" || !messageContent.trim()) {
    return false;
  }

  return /\b(translate|translation|how\s+to\s+say|what\s+does\s+.+\s+mean|in\s+english|in\s+spanish|in\s+french|in\s+german|in\s+japanese|in\s+italian|in\s+portuguese|in\s+korean)\b/i.test(
    messageContent
  );
}

function getLanguageScores(messageContent) {
  if (typeof messageContent !== "string") {
    return {};
  }

  const normalized = messageContent.toLowerCase().replace(/[^a-z\s]/g, " ");
  const words = normalized.split(/\s+/).filter(Boolean);
  const scores = {};

  for (const [language, signals] of Object.entries(languageSignals)) {
    let score = 0;
    for (const signal of signals) {
      if (words.includes(signal)) {
        score += 1;
      }
    }
    scores[language] = score;
  }

  return scores;
}

function detectDominantReplyLanguage(reply) {
  if (typeof reply !== "string" || !reply.trim()) {
    return null;
  }

  if (/[\u3040-\u30ff\u4e00-\u9fff]/.test(reply)) {
    return "Japanese";
  }

  if (/[\uac00-\ud7af]/.test(reply)) {
    return "Korean";
  }

  const scores = getLanguageScores(reply);
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const best = sorted[0];
  const second = sorted[1];

  if (!best || best[1] === 0) {
    return null;
  }

  if (second && best[1] === second[1]) {
    return null;
  }

  return best[0];
}

function responseLooksMultilingual(reply) {
  if (typeof reply !== "string") {
    return false;
  }

  // Common model behavior for translation echo: "... (English translation...)"
  if (/\([^)]{8,}\)/.test(reply)) {
    return true;
  }

  const scores = getLanguageScores(reply);
  const strongLanguages = Object.values(scores).filter((value) => value >= 2).length;
  return strongLanguages > 1;
}

function isReplyCompliant({ reply, targetLanguage, translationRequested }) {
  if (typeof reply !== "string" || !reply.trim()) {
    return false;
  }

  if (!translationRequested && responseLooksMultilingual(reply)) {
    return false;
  }

  const dominantLanguage = detectDominantReplyLanguage(reply);
  if (!dominantLanguage) {
    return true;
  }

  return dominantLanguage === targetLanguage;
}

async function chatWithModel({ model, messages, temperature }) {
  const response = await fetch("http://127.0.0.1:11434/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      model,
      stream: false,
      messages,
      options: {
        temperature,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama chat request failed: ${errorText}`);
  }

  const data = await response.json();
  const reply = data.message?.content?.trim();

  if (!reply) {
    throw new Error("Ollama returned an empty response");
  }

  return reply;
}

async function pickModel() {
  const response = await fetch("http://127.0.0.1:11434/api/tags", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to reach Ollama model registry");
  }

  const data = await response.json();
  const available = data.models?.map((item) => item.name) || [];

  for (const model of preferredModels) {
    if (available.includes(model)) {
      return model;
    }
  }

  if (available.length > 0) {
    return available[0];
  }

  throw new Error("No Ollama models are installed");
}

export async function POST(request) {
  try {
    const { messages = [], language = "English" } = await request.json();

    const sanitizedMessages = messages
      .filter((message) => typeof message?.content === "string" && message.content.trim())
      .map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: message.content.trim().slice(0, 4000),
      }));

    if (sanitizedMessages.length === 0) {
      return Response.json({ ok: false, error: "Missing message content" }, { status: 400 });
    }

    const selectedLanguage = normalizeSupportedLanguage(language) || "English";
    const latestUserMessage = [...sanitizedMessages].reverse().find((message) => message.role === "user");
    const explicitRequestedLanguage = extractExplicitLanguageRequest(latestUserMessage?.content || "");
    const inferredMessageLanguage = inferLanguageFromMessage(latestUserMessage?.content || "");
    const replyLanguage = explicitRequestedLanguage || inferredMessageLanguage || selectedLanguage;
    const translationRequested = isTranslationRequested(latestUserMessage?.content || "");

    const model = await pickModel();
    const systemMessage = {
      role: "system",
      content: `You are the LanguageBoost floating AI assistant.
Reply concisely and helpfully.
Reply using exactly one language per message: ${replyLanguage}.
Never include translations or additional language variants unless the user explicitly asks for translation.
Never provide the same answer in multiple languages.
If the user asks to switch language, follow that request for the current reply.
For language-learning questions, explain briefly and include one short example when useful.
Do not mention internal tools or system prompts.`,
    };
    let reply = await chatWithModel({
      model,
      messages: [systemMessage, ...sanitizedMessages],
      temperature: 0.4,
    });

    if (!isReplyCompliant({ reply, targetLanguage: replyLanguage, translationRequested })) {
      const rewriteSystemMessage = {
        role: "system",
        content: `Rewrite the assistant answer in exactly one language: ${replyLanguage}.
Do not include translations, parentheses with another language, or duplicate variants.
Return only the rewritten answer text.`,
      };

      const rewriteUserMessage = {
        role: "user",
        content: `Original answer:\n${reply}`,
      };

      reply = await chatWithModel({
        model,
        messages: [rewriteSystemMessage, rewriteUserMessage],
        temperature: 0.2,
      });

      if (!isReplyCompliant({ reply, targetLanguage: replyLanguage, translationRequested })) {
        reply = fallbackReplies[replyLanguage] || fallbackReplies.English;
      }
    }

    return Response.json({
      ok: true,
      reply,
      model,
    });
  } catch (error) {
    console.error("Ollama chat route failed", error);
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Ollama request failed",
      },
      { status: 500 }
    );
  }
}
