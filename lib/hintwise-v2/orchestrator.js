// lib/hintwise-v2/orchestrator.js

import { classifyIntent } from "./pipeline/intentClassifier";
import { lockPattern } from "./pipeline/patternLock";
import { analyzeDifficulty } from "./pipeline/difficultyAnalyzer";
import { createInitialState, updateState } from "./pipeline/stateEngine";
import { analyzeAttempt } from "./pipeline/attemptAnalyzer";
import { generateHint } from "./pipeline/hintEngine";
import { detectStruggle } from "./pipeline/struggleDetector";
import { adapt } from "./pipeline/adaptiveLayer";
import { fullSolutionEngine } from "./pipeline/fullSolutionEngine";

export async function runHintwisePipeline(
  input,
  action,
  state,
  userProfile,
  problemQuery, // 🔥 always pass original problem
) {
  // -----------------------
  // 🔥 FULL SOLUTION MODE
  // -----------------------
  if (action === "SHOW_SOLUTION") {
    const solution = await fullSolutionEngine({
      problem: problemQuery,
      input: input,
      state,
      userProfile,
    });

    return {
      type: "FULL_SOLUTION",
      data: solution,
    };
  }

  // -----------------------
  // 🧠 INTENT
  // -----------------------
  const intent = classifyIntent(input);

  // -----------------------
  // 🆕 NEW PROBLEM
  // -----------------------
  if (!state.pattern) {
    const patternData = await lockPattern(input);
    const difficultyData = analyzeDifficulty(input);

    createInitialState(state, patternData, difficultyData);

    return {
      feedback: `Pattern identified: ${patternData.pattern}`,

      hint: patternData.steps?.[0] || "Start with understanding the problem",

      step_analysis: {
        reached_step: 0,
      },

      meta: {
        pattern: patternData.pattern,
        confidence: patternData.confidence,
      },
    };
  }

  // -----------------------
  // 👨‍💻 USER ATTEMPT
  // -----------------------
  if (action === "USER_ATTEMPT") {
    const analysis = await analyzeAttempt(input, state);

    state.last_analysis = analysis;

    // track attempt history
    state.attempt_history = state.attempt_history || [];
    state.attempt_history.push({
      mistake_type: analysis.mistake_type,
    });

    if (state.attempt_history.length > 5) {
      state.attempt_history.shift();
    }

    // learning context update
    state.learning_context = state.learning_context || {};
    state.learning_context.last_mistake_type = analysis.mistake_type;

    return analysis;
  }

  // -----------------------
// 💡 HINT FLOW
// -----------------------
const struggle = detectStruggle(state);

// ✅ FINAL STEP HANDLING
if (state.current_step_index >= state.algorithm_steps.length - 1) {
  return {
    feedback: "You're at the final step!",
    hint: "Now combine all steps and implement the full solution.",
    step_analysis: {
      reached_step: state.current_step_index,
    },
  };
}

// ✅ GENERATE HINT
const hint = await generateHint(state, struggle);

// ✅ STORE LAST HINT (IMPORTANT)
state.learning_context = state.learning_context || {};
state.learning_context.last_bug_hint = hint;

// ✅ MOVE STEP FORWARD
state.current_step_index += 1;

// ✅ UPDATE STATE
updateState(state);

return {
  feedback: "Here's your next hint:",
  hint,
  step_analysis: {
    reached_step: state.current_step_index,
  },
};
}
