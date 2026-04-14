import { groq } from "@/lib/groq";

const DEBUG = true;
const log = (...args) => DEBUG && console.log("[Validator]", ...args);

// ------------------------
// SAFE PARSER
// ------------------------
function safeParse(content) {
  try {
    return JSON.parse(content);
  } catch {
    try {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
    } catch {}
  }
  return null;
}

// ------------------------
// MAIN VALIDATOR
// ------------------------
export async function validatePattern(input, patternData) {
  log("Validating:", patternData.pattern);
  const prompt = `
You are a strict senior DSA expert.

Problem:
"${input}"

Detected Pattern:
${patternData.pattern}

Steps:
${(patternData.steps || []).join(", ")}

Task:
1. Decide if this pattern is OPTIMAL
2. If incorrect, suggest a better pattern
3. Regenerate correct steps

Rules:
- DO NOT assume any default pattern
- DO NOT bias toward specific patterns
- Only change pattern if clearly wrong
- Be confident but not aggressive

Return ONLY JSON:

{
  "is_correct": true/false,
  "final_pattern": "...",
  "final_steps": ["...", "..."],
  "confidence": 0-1
}
`;

  try {
    const res = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });

    const parsed = safeParse(res.choices[0].message.content);

    if (!parsed) {
      log("Parse failed");
      throw new Error("Parsing failed");
    }

    // ------------------------
    // CASE 1: Pattern is correct
    // ------------------------
    if (parsed.is_correct) {
      log("Pattern correct");
      return {
        pattern: patternData.pattern,
        secondary: patternData.secondary,
        confidence: parsed.confidence ?? patternData.confidence ?? 0.7,
        steps: patternData.steps,
      };
    }

    // ------------------------
    // CASE 2: Pattern is incorrect but AI suggests fix
    // ------------------------
    if (parsed.final_pattern) {
      log("Pattern corrected:", parsed.final_pattern);
      return {
        pattern: parsed.final_pattern,
        secondary: patternData.secondary,
        confidence: parsed.confidence ?? 0.7,
        steps: parsed.final_steps || patternData.steps,
      };
    }

    // ------------------------
    // CASE 3: Uncertain → KEEP original (important)
    // ------------------------

     log("Uncertain → keeping original");
    return {
      pattern: patternData.pattern || "unknown",
      secondary: patternData.secondary,
      confidence: patternData.confidence ?? 0.5,
      steps: patternData.steps || [],
    };
  } catch (err) {
   log("❌ Validator error:", err);

    // ------------------------
    // FINAL SAFE FALLBACK
    // ------------------------
    return {
      pattern: patternData.pattern || "unknown",
      secondary: patternData.secondary,
      confidence: 0,
      steps: patternData.steps?.length
        ? patternData.steps
        : [
            "Understand the problem clearly",
            "Break it into smaller parts",
            "Try a simple approach",
            "Optimize step by step",
          ],
    };
  }
}