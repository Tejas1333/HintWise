import { groq } from "@/lib/groq";

const DEBUG = true;
const log = (...args) => DEBUG && console.log("[Difficulty]", ...args);

// ------------------------
// SAFE JSON PARSER
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
// LOCAL SCORING ENGINE
// ------------------------
function computeLocalScore(input, patternData = {}) {
  const text = input.toLowerCase();

  let score = 0;
  const signals = [];

  // 1. Pattern complexity
  const patternWeights = {
    array: 1,
    hash_map: 1,
    set: 1,
    two_pointer: 2,
    sliding_window: 2,
    stack: 2,
    queue: 2,
    heap: 3,
    tree: 3,
    graph: 3,
    binary_tree: 3,
    dynamic_programming: 4,
    recursion: 3,
  };

  const pattern = patternData.pattern || "";

  if (patternWeights[pattern]) {
    score += patternWeights[pattern];
    signals.push(pattern);
  }

  // 2. Step complexity
  const steps = patternData.steps || [];

  if (steps.length <= 3) score += 1;
  else if (steps.length <= 5) score += 2;
  else if (steps.length > 5) score += 3;

  // 3. Constraints
  if (/1e\d+|\d{5,}/.test(text)) {
    score += 2;
    signals.push("high_constraints");
  }

  if (
    text.includes("optimize") ||
    text.includes("minimum") ||
    text.includes("maximum")
  ) {
    score += 1;
    signals.push("optimization");
  }

  // 4. Multi-pattern
  if ((patternData.secondary || []).length > 0) {
    score += 2;
    signals.push("multi_pattern");
  }

  // 5. DP signals
  if (
    text.includes("subset") ||
    text.includes("partition") ||
    text.includes("ways") ||
    text.includes("count")
  ) {
    score += 2;
    signals.push("dp_signal");
  }

  return { score, signals };
}

// ------------------------
// AI ANALYZER (OPTIONAL)
// ------------------------
async function aiDifficultyAnalyzer(input, patternData) {
  const prompt = `
Analyze this DSA problem and return JSON:

{
  "difficulty": "EASY | MEDIUM | HARD",
  "pattern_complexity": 1-5,
  "step_complexity": 1-5,
  "constraint_complexity": 1-5
}

Problem:
${input}

Detected Pattern:
${patternData.pattern}

Steps:
${(patternData.steps || []).join(", ")}
`;

  try {
    const res = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const parsed = safeParse(res.choices[0].message.content);

    if (!parsed) return null;

    const aiScore =
      (parsed.pattern_complexity || 0) +
      (parsed.step_complexity || 0) +
      (parsed.constraint_complexity || 0);

    return {
      difficulty: parsed.difficulty,
      aiScore,
    };
  } catch {
    return null;
  }
}

// ------------------------
// FINAL ANALYZER (HYBRID)
// ------------------------
export async function analyzeDifficulty(input, patternData = {}) {
  // 1. LOCAL SCORE
  const { score: localScore, signals } = computeLocalScore(
    input,
    patternData
  );

  let finalScore = localScore;
  let aiUsed = false;

  // 2. DECIDE WHETHER TO CALL AI
  const shouldUseAI =
    !patternData?.pattern || patternData.confidence < 0.75;

  if (shouldUseAI) {
    const aiResult = await aiDifficultyAnalyzer(input, patternData);

    if (aiResult) {
      aiUsed = true;

      // 🔥 HYBRID MERGE
      finalScore = Math.round(
        localScore * 0.5 + aiResult.aiScore * 0.5
      );
    }
  }

  // 3. FINAL CLASSIFICATION
  let difficulty = "MEDIUM";

  if (finalScore <= 2) difficulty = "EASY";
  else if (finalScore <= 6) difficulty = "MEDIUM";
  else difficulty = "HARD";

   log("Pattern:", patternData?.pattern || "unknown");
   log("Final Difficulty:", difficulty);

  return {
    difficulty,
    score: finalScore,
    signals,
    aiUsed,
  };
}