// ===============================
// ✅ fullSolutionEngine.js (FIXED)
// ===============================

import { groq } from "@/lib/groq";

export async function fullSolutionEngine(context) {
  const { problem, state, userProfile } = context;

  const prompt = `
Return ONLY valid JSON in this format:

{
  "approach": "...",
  "intuition": "...",
  "code": "...",
  "pseudocode": "...",
  "time_complexity": "...",
  "space_complexity": "...",
  "edge_cases": ["..."],
  "common_mistakes": ["..."]
}

Problem: ${problem}
Pattern: ${state?.pattern || "unknown"}
User Level: ${userProfile?.level || "beginner"}
`;

  const res = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
  });

  const raw = res.choices[0].message.content;

  try {
    return JSON.parse(raw);
  } catch {
    return {
      approach: raw,
      intuition: "",
      code: "",
      pseudocode: "",
      time_complexity: "",
      space_complexity: "",
      edge_cases: [],
      common_mistakes: [],
    };
  }
}