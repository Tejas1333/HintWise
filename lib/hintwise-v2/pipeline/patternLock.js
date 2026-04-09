import { groq } from "@/lib/groq";

export async function lockPattern(input) {
  const enrichedQuery = `
Problem: ${input}

Explain clearly what this problem is asking.
`;
  const prompt = `
You are an expert DSA problem solver.

Task:
Identify the BEST primary pattern AND possible secondary patterns.

Allowed patterns:
Array, hash_map, set, binary_search, strings, linked_list, recursion, 
bit_manipulation, stack, queue, sliding_window, two_pointer, 
heap, greedy_algorithms, binary_tree, binary_search_tree, 
graph, dynamic_programming, tries, , brute_force

Rules:
- Choose ONE primary pattern
- Optionally include secondary patterns (if applicable)
- Prefer optimized approaches over brute force
- NEVER default to brute_force unless no optimization exists

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

  const res = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
  });

  try {
    const parsed = JSON.parse(res.choices[0].message.content);
    console.log("AI PATTERN OUTPUT:", parsed);

    return {
      pattern: parsed.primary_pattern,
      secondary: parsed.secondary_patterns || [],
      confidence: parsed.confidence,
      steps: parsed.steps,
    };
  } catch (err) {
    // fallback
    return {
      pattern: "brute_force",
      confidence: 0.3,
      steps: ["Try all possibilities", "Optimize later"],
    };
  }
}
