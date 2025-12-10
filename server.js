import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";     // <-- required for sending files
import { fileURLToPath } from "url";
import OpenAI from "openai";
import { buildPromptForType } from "./promptBuilder.js";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve all static files (index.html, script.js, style.css, etc.)
app.use(express.static(__dirname));

// ----------------------
// OPENAI CLIENT
// ----------------------
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ----------------------
// SYSTEM PROMPT
// ----------------------
const SYSTEM_PROMPT = `
You are Franky's personal documentation assistant.

Your job:
Turn rough, shorthand notes into clean, structured documents in Franky's voice
that are ready to share with stakeholders (Eng, Design, BI, leads, etc.).

Franky's style:
- Clear, concise, and practical
- Product-thinking first: problem → context → impact
- Uses metrics (ATC%, CTR, CVR) when mentioned
- Short paragraphs, smart bullet points
- No buzzwords or fluff
- Sounds like a senior PM, not textbook

Rules:
- Do NOT use '#' headings.
- Do NOT use '*' or '**' for bold.
- Use only normal text, line breaks, and '- ' for bullet points.
- No code fences, no markup.
- Do NOT invent fake metrics or facts.
- Keep vague items as TBD.
- Output clean Markdown only.
`;

// ----------------------
// GENERATION ENDPOINT
// ----------------------
app.post("/generate", async (req, res) => {
  const { docType, answers } = req.body;

  try {
    const userPrompt = buildPromptForType(docType, answers);

    const completion = await client.chat.completions.create({
      model: "gpt-5.1",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
    });

    res.json({
      content: completion.choices[0].message.content,
    });

  } catch (err) {
    console.error("❌ Error generating content:", err);
    res.status(500).json({ error: "Generation failed" });
  }
});

// ----------------------
// FALLBACK: ALWAYS SERVE INDEX.HTML
// ----------------------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ----------------------
// START SERVER
// ----------------------
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});