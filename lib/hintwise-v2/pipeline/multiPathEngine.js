import { groq } from "@/lib/groq";

export async function multiPathEngine({ problem, state }) {
  const prompt = `
You are an expert DSA problem solver.

Problem:
${problem}

Primary Pattern:
${state.pattern}

Give 1-2 alternative approaches.

Rules:
- Short explanation
- No full code
- Mention when to use

Return ONLY JSON:

{
  "alternatives": [
    {
      "approach": "...",
      "when_to_use": "..."
    }
  ]
}
`;

  try {
    const res = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    let text = res.choices[0].message.content;

    // 🔥 Clean response
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");

    if (first !== -1 && last !== -1) {
      text = text.slice(first, last + 1);
    }

    return JSON.parse(text);

  } catch (err) {
    console.error("Multi-path failed:", err);

    return {
      alternatives: [],
    };
  }
}