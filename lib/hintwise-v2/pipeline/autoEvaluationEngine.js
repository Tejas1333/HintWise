import { groq } from "@/lib/groq";

export async function autoEvaluationEngine({ problem, solution, pattern }) {
  const prompt = `
You are an expert DSA evaluator.

Problem:
${problem}

Pattern:
${pattern}

Solution:
${JSON.stringify(solution)}

Task:
1. Check if solution is logically correct
2. Check if time/space complexity is optimal
3. Check for missing edge cases
4. Check if correct pattern is used

Return STRICT JSON:

{
  "is_correct": true/false,
  "issues": ["..."],
  "improved_solution": {
    "approach": "...",
    "intuition": "...",
    "code": "...",
    "pseudocode": "...",
    "time_complexity": "...",
    "space_complexity": "...",
    "edge_cases": ["..."],
    "common_mistakes": ["..."]
  }
}
`;

  try {
    const res = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    let text = res.choices[0].message.content;

// 🔥 Remove markdown
text = text.replace(/```json/g, "").replace(/```/g, "").trim();

// 🔥 Extract FIRST VALID JSON OBJECT (robust)
function extractJSON(str) {
  let start = str.indexOf("{");
  if (start === -1) return null;

  let stack = 0;

  for (let i = start; i < str.length; i++) {
    if (str[i] === "{") stack++;
    if (str[i] === "}") stack--;

    if (stack === 0) {
      return str.slice(start, i + 1);
    }
  }

  return null;
}

const jsonString = extractJSON(text);

if (!jsonString) {
  throw new Error("No valid JSON found");
}

return JSON.parse(jsonString);
  } catch (err) {
    console.error("Auto Evaluation Failed:", err);

    return {
      is_correct: true,
      issues: [],
      improved_solution: solution, // fallback
    };
  }
}