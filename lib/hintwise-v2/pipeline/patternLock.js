import { validatePattern } from "./patternValidator";
import { groq } from "@/lib/groq";

const DEBUG = true;
const log = (...args) => DEBUG && console.log("[PatternLock]", ...args);

// ------------------------
// SAFE PARSER
// ------------------------
function safeParse(content) {
  try {
    return JSON.parse(content);
  } catch {
    try {
      const cleaned = content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      return JSON.parse(cleaned);
    } catch {
      try {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
      } catch {}
    }
  }
  return null;
}

// ------------------------
// 🔥 NEW: ENRICH QUERY
// ------------------------
async function enrichQuery(input) {
  log("Input:", input);
  const prompt = `
You are a DSA problem identifier.

User input:
"${input}"

Task:
1. Check if this refers to a known problem from:
   LeetCode, GeeksforGeeks, Coding Ninjas, Codeforces, HackerRank, HackerEarth
2. If YES:
   - Return full structured problem:
     description, input, output, constraints
3. If NOT:
   - Just return the input as-is

Return ONLY JSON:

{
  "is_known": true/false,
  "title": "...",
  "description": "...",
  "input_format": "...",
  "output_format": "...",
  "constraints": "...",
  "combined": "full enriched problem text"
}
`;

  try {
    const res = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const parsed = safeParse(res.choices[0].message.content);

    if (!parsed){
      log("Enrich failed → using raw input");
      return input;
    } 

    log("Enriched Input:", parsed.combined);
    return parsed.combined || input;
  } catch(e) {
    log("Enrich error:", e);
    return input;
  }
}

// ------------------------
// PROMPT BUILDER
// ------------------------
function buildPrompt(input, mode = "normal") {
  let extraRules = "";

  if (mode === "strict") {
    extraRules = `
- ONLY choose from allowed patterns
- DO NOT guess randomly
- RETURN ONLY JSON
`;
  }

  if (mode === "simple") {
    extraRules = `
- Focus on core idea only
- Be concise
`;
  }

  return `
You are an expert DSA problem solver.

Task:
Identify the BEST primary pattern AND possible secondary patterns.

Allowed patterns:
Array, hash_map, set, binary_search, strings, linked_list, recursion, 
bit_manipulation, stack, queue, sliding_window, two_pointer, 
heap, greedy_algorithms, binary_tree, binary_search_tree, 
graph, dynamic_programming, tries

Rules:
- Choose ONE primary pattern
- Prefer optimized approaches
- NEVER choose brute_force if optimization exists
${extraRules}

Problem:
"${input}"

Return ONLY JSON:

{
  "primary_pattern": "...",
  "secondary_patterns": ["...", "..."],
  "confidence": 0-1,
  "steps": ["step 1", "step 2", "..."]
}
`;
}

// ------------------------
// AI CALL
// ------------------------
async function callAI(prompt) {
  const res = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  return safeParse(res.choices[0].message.content);
}

// ------------------------
// MAIN FUNCTION
// ------------------------
export async function lockPattern(input) {
  // 🔥 STEP 1: ENRICH INPUT
  const enrichedInput = await enrichQuery(input);

  const attempts = ["normal", "strict", "simple"];

  for (let mode of attempts) {
    try {
      log("Attempt:", mode);
      const prompt = buildPrompt(enrichedInput, mode);
      const parsed = await callAI(prompt);

      if (!parsed){
        log("Parse failed");
        continue;
      } 

      log("Parsed:", parsed);

      const patternData = {
        pattern: parsed.primary_pattern,
        secondary: parsed.secondary_patterns || [],
        confidence: parsed.confidence || 0,
        steps: parsed.steps || [],
      };

      const validated = await validatePattern(enrichedInput, patternData);

      log("Validated:", validated);

      if (
        validated?.pattern &&
        validated.pattern !== "brute_force" &&
        (validated.confidence ?? 0) >= 0.5
      ) {
        log("✅ Pattern locked:", validated.pattern);
        return validated;
      }
    } catch (err) {
      log("Attempt error:", err);
    }
  }

  // ------------------------
  // FINAL FALLBACK
  // ------------------------
  
  log("❌ Fallback triggered");

  return {
    pattern: "unknown",
    confidence: 0,
    secondary: [],
    steps: [
      "Understand the problem clearly",
      "Identify input/output",
      "Try a simple approach",
      "Optimize step by step",
    ],
  };
}