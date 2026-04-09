import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function generateHint(query, type, hints = []) {
  if (!query || !type) {
    return "Enter query and type";
  }

  const allHintsContent = hints.map((h) => h.content).join("\n- ");

  const prompt = [
    {
      role: "system",
      content: `
You are an expert AI assistant specializing in Data Structures and Algorithms.

Rules:
- slight → ONLY a guiding question (no algorithm)
- medium → approach + why (1–2 lines)
- full → steps + pseudocode
- No extra text
- No repetition
`,
    },
    {
      role: "user",
      content: `Generate a ${type} hint for: ${query}
Avoid these hints:
${allHintsContent || "None"}`,
    },
  ];

  console.log("Prompt:", JSON.stringify(prompt, null, 2));

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: prompt,
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 500,
    });

    console.log(
      "chatCompletion:",
      JSON.stringify(chatCompletion, null, 2)
    );

    return (
      chatCompletion.choices[0]?.message?.content?.trim() ||
      "No hint generated"
    );
  } catch (error) {
    console.error("Groq Error:", error);
    return "Error generating hint";
  }
}

async function handleDuplicate(query, type, hints = []) {
  const maxRetries = 5;

  for (let i = 0; i < maxRetries; i++) {
    const generatedHint = await generateHint(query, type, hints);

    console.log("generatedHint:", generatedHint);

    const isDuplicate = hints.some(
      (hint) =>
        hint.content.trim().toLowerCase() ===
        generatedHint.trim().toLowerCase()
    );

    if (!isDuplicate) {
      return generatedHint;
    }
  }

  return "Could not generate unique hint";
}

export async function POST(request) {
  try {
    const { query, type, hints = [] } = await request.json();

    console.log(`Query: ${query}, HintType: ${type}`);

    const result = await handleDuplicate(query, type, hints);

    return NextResponse.json({ hintResponse: result });
  } catch (error) {
    console.error("API Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}