import { groq } from "@/lib/groq";

// --------------------
// SAFE JSON PARSER
// --------------------
function safeParse(content) {
  try {
    return JSON.parse(content);
  } catch {
    try {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
    } catch {}
    return null;
  }
}

// --------------------
// GENERAL ANALYZER (fallback)
// --------------------
async function generalCodeAnalyzer(input, state) {
  const prompt = `
You are an expert DSA tutor.

Problem Pattern:
${state.pattern}

User Code:
${input}

Task:
1. Identify approach
2. Identify correctness
3. Give hint

Return JSON:
{
  "mistake_type": "...",
  "feedback": "...",
  "hint": "..."
}
`;

  const res = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  const parsed = safeParse(res.choices[0].message.content);

  if (!parsed) {
    return {
      mistake_type: "unknown",
      feedback: "You're on the right track.",
      hint: "Try refining your approach.",
      step_analysis: { reached_step: null, next_step: null },
    };
  }

  return {
    ...parsed,
    step_analysis: { reached_step: null, next_step: null },
  };
}

// --------------------
// MAIN FUNCTION
// --------------------

export async function analyzeAttempt(input, state) {
  try {
    if (!state?.algorithm_steps?.length) {
      return await generalCodeAnalyzer(input, state);
    }

    // --------------------
    // STEP MAPPER
    // --------------------
    const stepMapRes = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            algorithm_steps: state.algorithm_steps,
            userCode: input,
          }),
        },
      ],
      temperature: 0.2,
    });

    const stepData = safeParse(stepMapRes.choices[0].message.content);

    if (!stepData) {
      return await generalCodeAnalyzer(input, state);
    }

    const currentIndex = stepData.detected_step_index ?? -1;
    const nextStep = state.algorithm_steps[currentIndex + 1];

    // =====================================================
    // ✅ FULL SOLUTION DETECTED
    // =====================================================
    if (!nextStep) {
  return {
    mistake_type: "none",
    is_solution: true,
    feedback: "Your solution is correct!",
    hint: "Great job! You’ve completed all steps.",
    step_analysis: {
      reached_step: currentIndex,
      next_step: null,
    },
  };
}

    // --------------------
    // STEP EVALUATOR
    // --------------------
    const evalRes = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            current_step: nextStep,
            userCode: input,
            previous_steps: state.algorithm_steps.slice(
              0,
              currentIndex + 1
            ),
          }),
        },
      ],
      temperature: 0.3,
    });

    const evalData = safeParse(evalRes.choices[0].message.content);

    if (!evalData) {
      return await generalCodeAnalyzer(input, state);
    }

    return {
      mistake_type: evalData.mistake_type,
      feedback: evalData.explanation,
      hint: evalData.next_hint,
      step_analysis: {
        reached_step: currentIndex,
        next_step: currentIndex + 1,
      },
    };
  } catch (err) {
    console.error(err);

    return {
      mistake_type: "unknown",
      feedback: "Try reviewing your logic step by step.",
      hint: "Focus on improving your approach.",
      step_analysis: { reached_step: null, next_step: null },
    };
  }
}