import { groq } from "@/lib/groq";

export async function fullSolutionEngine(context) {
  const { problem, input, state, userProfile } = context;
  const prompt = `NNED PROMPT`;

  const res = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
  });

  const raw = res.choices[0].message.content;

  try {
    return JSON.parse(raw);
  } catch {
    return raw; // 🔥 IMPORTANT FIX
  }
}
