import { groq } from "@/lib/groq";

export async function generateHint({
  state,
  struggle,
  lastAnalysis,
  userAttempt,
  isAttemptFlow,
  stepIndex,
}) {
  const steps = state.algorithm_steps || [];
  const currentStep = steps[stepIndex] || "";

  const mode = isAttemptFlow ? "ATTEMPT_FEEDBACK" : "GUIDED";

  let prompt = "";

  // =========================
  // 🎯 GUIDED MODE (SHORT)
  // =========================
  if (!isAttemptFlow) {
    prompt = `
You are a DSA interviewer.

Current Step:
"${currentStep}"

Task:
Give a SHORT hint (1-2 lines max)

Rules:
- No full solution
- No code
- Only guide next step
- Keep it concise
`;
  }

  // =========================
  // 🧠 ATTEMPT MODE (SMART)
  // =========================
  else {
    prompt = `
You are a DSA mentor helping debug a student's thinking.

Current Step:
"${currentStep}"

User Attempt:
${userAttempt}

Mistake Type:
${lastAnalysis?.mistake_type}

Feedback:
${lastAnalysis?.feedback}

---

Task:
1. Identify EXACT mistake in 1 line
2. Give a corrective hint in 1-2 lines

Rules:
- DO NOT give full solution
- DO NOT write full code
- Focus only on correcting thinking
- Keep response under 60 words
`;
  }

  const res = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: isAttemptFlow ? 150 : 80, // 🔥 key difference
  });

  let output = res.choices[0].message.content.trim();

  // =========================
  // 🔥 SAFETY TRIM (LIGHT)
  // =========================
  const words = output.split(" ");

  if (!isAttemptFlow && words.length > 30) {
    output = words.slice(0, 30).join(" ") + "...";
  }

  if (isAttemptFlow && words.length > 60) {
    output = words.slice(0, 60).join(" ") + "...";
  }

  return output;
}