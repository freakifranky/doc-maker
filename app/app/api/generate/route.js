import Anthropic from "@anthropic-ai/sdk";
import { buildPromptForType, SYSTEM_PROMPT } from "@/lib/promptBuilder";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { docType, answers } = await request.json();

    if (!docType || !answers) {
      return Response.json(
        { error: "Missing docType or answers" },
        { status: 400 }
      );
    }

    const userPrompt = buildPromptForType(docType, answers);

    if (userPrompt === "Unknown doc type.") {
      return Response.json(
        { error: "Unknown document type" },
        { status: 400 }
      );
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const content = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return Response.json({ content });
  } catch (err) {
    console.error("Generation error:", err);

    const status = err?.status || 500;
    const detail =
      err?.message || "Generation failed. Check server logs.";

    return Response.json({ error: detail }, { status });
  }
}
