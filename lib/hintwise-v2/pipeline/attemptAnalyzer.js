import { groq } from "@/lib/groq";

export async function analyzeAttempt(input, state) {
  const prompt = `
You are an expert DSA interviewer.

A student is solving a problem.

Pattern: ${state.pattern}
Steps: ${state.algorithm_steps.join(", ")}

Student Attempt:
"${input}"

Your task:
1. Identify mistake type:
   - logic_error
   - wrong_pattern
   - missing_edge_case
   - incomplete

2. Give guidance ONLY (no full solution)

3. Be concise and helpful

Return JSON:
{
  "mistake_type": "...",
  "feedback": "..."
}
`;

  const res = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
  });

  try {
    return JSON.parse(res.choices[0].message.content);
  } catch {
    return {
      mistake_type: "unknown",
      feedback: "Try reviewing your approach step by step.",
    };
  }
}