import { groq } from "@/lib/groq";

export async function reflectionEngine({ problem, state }) {
  const prompt = `
You are an expert DSA mentor.

Problem:
${problem}

Pattern:
${state.pattern}

Steps:
${state.algorithm_steps?.join(", ")}

Generate 3 deep reflection questions.

Rules:
- Focus on understanding
- Avoid trivial questions
- Make user think

Return ONLY JSON:

{
  "reflection": [
    "question1",
    "question2",
    "question3"
  ]
}
`;

  try {
    const res = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
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
    console.error("Reflection failed:", err);

    return {
      reflection: [
        "Why does this approach work?",
        "What is the key insight?",
        "How would this fail for edge cases?"
      ],
    };
  }
}