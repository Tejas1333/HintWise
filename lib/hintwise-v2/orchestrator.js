
// ===============================
// ✅ orchestrator.js (IMPROVED)
// ===============================

import { classifyIntent } from "./pipeline/intentClassifier";
import { lockPattern } from "./pipeline/patternLock";
import { analyzeDifficulty } from "./pipeline/difficultyAnalyzer";
import { createInitialState, updateState } from "./pipeline/stateEngine";
import { analyzeAttempt } from "./pipeline/attemptAnalyzer";
import { generateHint } from "./pipeline/hintEngine";
import { detectStruggle } from "./pipeline/struggleDetector";
import { fullSolutionEngine } from "./pipeline/fullSolutionEngine";

export async function runHintwisePipeline(
  input,
  action,
  state,
  userProfile,
  problemQuery
) {
  const intent = classifyIntent(input);

  // 🔥 Ensure pattern always exists
  if (!state.pattern) {
    const patternData = await lockPattern(problemQuery);
    const difficultyData = analyzeDifficulty(problemQuery);

    createInitialState(state, patternData, difficultyData);
  }

  // =======================
  // ✅ FULL SOLUTION (FIXED)
  // =======================
  if (action === "SHOW_SOLUTION") {
    const solution = await fullSolutionEngine({
      problem: problemQuery,
      state,
      userProfile,
    });

    return {
      type: "FULL_SOLUTION",
      data: solution,
    };
  }

  // =======================
  // 👨‍💻 USER ATTEMPT
  // =======================
  if (action === "USER_ATTEMPT") {
    const analysis = await analyzeAttempt(input, state);

    state.last_analysis = analysis;

    state.attempt_history = state.attempt_history || [];
    state.attempt_history.push({
      mistake_type: analysis.mistake_type,
    });

    if (state.attempt_history.length > 5) {
      state.attempt_history.shift();
    }

    return analysis;
  }

  // =======================
  // 💡 HINT FLOW
  // =======================
  const struggle = detectStruggle(state);

  if (state.current_step_index >= state.algorithm_steps.length - 1) {
    return {
      feedback: "You're at the final step!",
      hint: "Now combine all steps and implement the full solution.",
      step_analysis: {
        reached_step: state.current_step_index,
      },
    };
  }

  const hint = await generateHint(state, struggle);

  state.current_step_index += 1;
  updateState(state);

  return {
    feedback: "Here's your next hint:",
    hint,
    step_analysis: {
      reached_step: state.current_step_index,
    },
  };
}