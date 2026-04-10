import { groq } from "@/lib/groq";

export async function validatePattern(input, patternData) {
  const prompt = `
You are a strict senior DSA expert.

Problem:
"${input}"

Detected Pattern:
${patternData.pattern}

Steps:
${patternData.steps.join(", ")}

Task:
1. Decide if this pattern is OPTIMAL
2. If pattern is "brute_force", assume it is WRONG
3. Suggest a better pattern if possible
4. Regenerate correct steps

Rules:
- NEVER accept brute_force if optimization exists
- Prefer:
  hash_map, sliding_window, two_pointer, dynamic_programming, binary_search, graph
- Be decisive

Return ONLY JSON:

{
  "is_correct": true/false,
  "final_pattern": "...",
  "final_steps": ["...", "..."]
}
`;

  try {
    const res = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });

    const parsed = JSON.parse(res.choices[0].message.content);

    // 🔥 FORCE CORRECTION
    if (!parsed.is_correct || patternData.pattern === "brute_force") {
      return {
        pattern: parsed.final_pattern || "dynamic_programming",
        secondary: patternData.secondary,
        confidence: 0.95,
        steps:
          parsed.final_steps || [
            "Define state",
            "Define transitions",
            "Apply DP",
          ],
      };
    }

    return patternData;
  } catch (err) {
    console.log("⚠️ VALIDATOR FAILED:", err);

    // 🔥 SAFE FALLBACK (CRITICAL FIX)
    return {
      pattern: "dynamic_programming",
      secondary: patternData.secondary,
      confidence: 0.5,
      steps: [
        "Define state",
        "Identify recurrence",
        "Use DP approach",
      ],
    };
  }
}