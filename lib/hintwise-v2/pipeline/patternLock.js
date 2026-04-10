import { validatePattern } from "./patternValidator";
import { groq } from "@/lib/groq";

export async function lockPattern(input) {
  const enrichedQuery = `
Problem: ${input}

Explain clearly what this problem is asking.
Also identify if this exists on platforms like LeetCode, HackerRank, etc.
`;

  const prompt = `
You are an expert DSA problem solver.

Task:
Identify the BEST primary pattern AND possible secondary patterns.

Allowed patterns:
Array, hash_map, set, binary_search, strings, linked_list, recursion, 
bit_manipulation, stack, queue, sliding_window, two_pointer, 
heap, greedy_algorithms, binary_tree, binary_search_tree, 
graph, dynamic_programming, tries, brute_force

Rules:
- Choose ONE primary pattern
- Prefer optimized approaches over brute force
- NEVER choose brute_force if optimization exists

Problem:
"${enrichedQuery}"

Return ONLY JSON:

{
  "primary_pattern": "...",
  "secondary_patterns": ["...", "..."],
  "confidence": 0-1,
  "steps": ["clear step 1", "clear step 2", "..."]
}
`;

  try {
    const res = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const parsed = JSON.parse(res.choices[0].message.content);

    console.log("AI PATTERN OUTPUT:", parsed);

    const patternData = {
      pattern: parsed.primary_pattern,
      secondary: parsed.secondary_patterns || [],
      confidence: parsed.confidence,
      steps: parsed.steps,
    };

    // 🔥 VALIDATION LAYER
    const validated = await validatePattern(input, patternData);

    console.log("VALIDATED PATTERN:", validated);

    // 🔥 HARD SAFETY (MOST IMPORTANT FIX)
    if (!validated?.pattern || validated.pattern === "brute_force") {
      console.log("⚠️ FORCE FIX APPLIED");

      return {
        pattern: "dynamic_programming",
        confidence: 0.6,
        steps: [
          "Define state",
          "Define recurrence relation",
          "Use memoization or tabulation",
          "Optimize space if possible",
        ],
      };
    }

    return validated;
  } catch (err) {
    console.error("PATTERN LOCK ERROR:", err);

    // 🔥 FINAL FALLBACK (SAFE)
    return {
      pattern: "dynamic_programming",
      confidence: 0.5,
      steps: [
        "Define state",
        "Define recurrence relation",
        "Use memoization",
      ],
    };
  }
}