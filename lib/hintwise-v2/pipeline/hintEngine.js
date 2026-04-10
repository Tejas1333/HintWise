import { groq } from "@/lib/groq";

export async function generateHint(state, struggle) {
  const step = state.algorithm_steps[state.current_step_index];

  const analysis = state.last_analysis || {};
  const context = state.learning_context || {};

  // 🔥 get last 2 attempts only
  const recentAttempts = (state.attempt_history || [])
    .slice(-2)
    .map((a, i) => `Attempt ${i + 1}: ${a.mistake_type}`)
    .join("\n");

  const prompt = `
You are a DSA tutor.

Rules:
- No full solution unless depth=5
- Keep hints short
- Encourage thinking
- Adapt based on user mistakes
- Avoid repeating same hint

Pattern: ${state.pattern}
Current Step: ${step}
Hint Depth: ${state.hint_depth}
Struggle Level: ${struggle}

User Context:
- Last Mistake: ${context.last_mistake_type || "none"}
- Repeated Mistakes: ${JSON.stringify(context.repeated_mistakes || {})}
- Previous Hint: ${context.last_bug_hint || "none"}

Recent Attempts:
${recentAttempts || "none"}

User Code Issue:
${analysis.feedback || "none"}

Instructions:
1. If same mistake repeated → change explanation style
2. If wrong_pattern → guide toward correct approach
3. If logic_error → focus on fixing logic
4. Focus ONLY on next step
5. Do NOT repeat same wording

Give a smart, targeted hint:
`;

  const res = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
  });

  return res.choices[0].message.content.trim();
}