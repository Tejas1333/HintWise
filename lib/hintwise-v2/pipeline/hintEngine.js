import { groq } from "@/lib/groq";

export async function generateHint(state, struggle) {
  const step = state.algorithm_steps[state.current_step_index];

  const prompt = `
You are a DSA tutor.

Rules:
- No full solution unless depth=5
- Keep hints short
- Encourage thinking

Pattern: ${state.pattern}
Step: ${step}
Depth: ${state.hint_depth}
Struggle: ${struggle}

Give hint:
`;

  const res = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
  });

  return res.choices[0].message.content.trim();
}