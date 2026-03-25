import Anthropic from "@anthropic-ai/sdk";
import { buildPromptForType, SYSTEM_PROMPT } from "@/lib/promptBuilder";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { docType, answers, attachments } = await request.json();

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

    const contentBlocks = [];
    contentBlocks.push({ type: "text", text: userPrompt });

    if (attachments && attachments.length > 0) {
      let attachmentContext = "\n\n---\n\nATTACHMENTS\n\nThe following attachments were uploaded alongside the text fields. Extract relevant data, insights, and details from them. Merge key findings into the appropriate sections of the document. Include a full extraction in an ## Appendix section at the end.\n\n";
      contentBlocks.push({ type: "text", text: attachmentContext });

      for (const att of attachments) {
        if (att.type === "image") {
          contentBlocks.push({
            type: "text",
            text: `**Attachment for "${att.fieldLabel}":**`,
          });
          contentBlocks.push({
            type: "image",
            source: {
              type: "base64",
              media_type: att.mediaType,
              data: att.data,
            },
          });
        } else if (att.type === "csv") {
          contentBlocks.push({
            type: "text",
            text: `**Attachment for "${att.fieldLabel}" (CSV data):**\n\`\`\`\n${att.data}\n\`\`\``,
          });
        }
      }
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: contentBlocks }],
    });

    const content = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return Response.json({ content });
  } catch (err) {
    console.error("Generation error:", err);

    const status = err?.status || 500;
    const detail = err?.message || "Generation failed. Check server logs.";

    return Response.json({ error: detail }, { status });
  }
}
