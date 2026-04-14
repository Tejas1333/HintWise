// ===============================
// ✅ orchestrator.js (FINAL)
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
  { problemQuery, userAttempt, action },
  state,
  userProfile
) {
  const intent = classifyIntent(problemQuery);

  // =======================
  // 🔐 INIT STATE
  // =======================
  if (!state.pattern) {
    const patternData = await lockPattern(problemQuery);
    const difficultyData = analyzeDifficulty(problemQuery);

    createInitialState(state, patternData, difficultyData);
  }

  // =======================
  // 📘 FULL SOLUTION
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
  // 👨‍💻 USER ATTEMPT (TEMP MODE)
  // =======================
  let analysis = null;
  let isAttemptFlow = false;

  if (action === "USER_ATTEMPT" && userAttempt?.trim()) {
    analysis = await analyzeAttempt(userAttempt, state);

    state.last_analysis = analysis;

    state.attempt_history = state.attempt_history || [];
    state.attempt_history.push({
      mistake_type: analysis.mistake_type,
    });

    if (state.attempt_history.length > 5) {
      state.attempt_history.shift();
    }

    // 🔥 Align step with user progress
    if (
      analysis?.step_analysis?.reached_step !== null &&
      analysis?.step_analysis?.reached_step !== undefined
    ) {
      state.current_step_index = Math.max(
        state.current_step_index,
        analysis.step_analysis.reached_step
      );
    }

    isAttemptFlow = true;
  }

  // =======================
  // 💡 HINT FLOW
  // =======================
  const struggle = detectStruggle(state);

  // ✅ NO HARD LIMIT (important)
  let stepIndex = Math.min(
    state.current_step_index,
    state.algorithm_steps.length - 1
  );

  const hint = await generateHint({
    state,
    struggle,
    lastAnalysis: isAttemptFlow ? analysis : null,
    userAttempt: isAttemptFlow ? userAttempt : null,
    isAttemptFlow,
    stepIndex,
  });

  // ✅ Only move forward in normal flow
  if (!isAttemptFlow) {
    if (state.current_step_index < state.algorithm_steps.length - 1) {
      state.current_step_index += 1;
    }
  }

  updateState(state);

  return {
    feedback: analysis?.feedback || "Here's your next hint:",
    hint,
    step_analysis: {
      reached_step: state.current_step_index,
    },
  };
}