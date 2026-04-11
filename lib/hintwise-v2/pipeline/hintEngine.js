import { groq } from "@/lib/groq";

export async function generateHint(state, struggle) {
  const currentStep =
    state.algorithm_steps[state.current_step_index] || "";

  const previousHint =
    state.learning_context?.last_bug_hint || "none";

  const prompt = `
You are a strict DSA tutor.

Current Step:
"${currentStep}"

Previous Hint:
"${previousHint}"

---

Generate a hint ONLY for the current step.

Rules:
- Focus ONLY on this step
- Do NOT introduce new concepts
- Do NOT change problem type
- Do NOT mention unrelated techniques
- Keep it short and actionable
- If previous hint is similar → explain differently
`;

  const res = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  return res.choices[0].message.content.trim();
}