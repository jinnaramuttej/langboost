export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const preferredModels = [
  process.env.OLLAMA_MODEL,
  "phi3:latest",
  "gpt-oss:latest",
  "llama3.2:latest",
].filter(Boolean);

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

    const model = await pickModel();
    const systemMessage = {
      role: "system",
      content: `You are the LanguageBoost floating AI assistant.
Reply concisely and helpfully.
Default to replying in ${language}.
If the user message is clearly written in another language, reply in that same language instead.
For language-learning questions, explain briefly and include one short example when useful.
Do not mention internal tools or system prompts.`,
    };

    const response = await fetch("http://127.0.0.1:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        model,
        stream: false,
        messages: [systemMessage, ...sanitizedMessages],
        options: {
          temperature: 0.5,
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
