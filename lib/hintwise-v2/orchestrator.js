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

const DEBUG = true;
const log = (...args) => DEBUG && console.log("[Pipeline]", ...args);
const startTime = Date.now();

function updateUserLearning(state, userProfile, analysis) {
  if (!userProfile || !state.pattern) return;

  // =====================
  // INIT MAPS
  // =====================
  userProfile.pattern_scores = userProfile.pattern_scores || {};
  userProfile.mistake_stats = userProfile.mistake_stats || {};

  const pattern = state.pattern;

  // =====================
  // PATTERN SCORING
  // =====================
  if (!userProfile.pattern_scores[pattern]) {
    userProfile.pattern_scores[pattern] = 0;
  }

  if (analysis?.mistake_type && analysis.mistake_type !== "none") {
    userProfile.pattern_scores[pattern] -= 1;
  }

  if (analysis?.is_solution) {
    userProfile.pattern_scores[pattern] += 2;
  }

  // =====================
  // MISTAKE TRACKING
  // =====================
  if (analysis?.mistake_type) {
    const m = analysis.mistake_type;

    if (!userProfile.mistake_stats[m]) {
      userProfile.mistake_stats[m] = 0;
    }

    userProfile.mistake_stats[m] += 1;
  }

  // =====================
  // HINT DEPENDENCY
  // =====================
  const hints = state.hint_usage_count || 0;

  userProfile.hint_dependency =
    userProfile.hint_dependency * 0.8 + (hints > 5 ? 0.2 : 0);
}

function applyAdaptiveHinting(state, userProfile) {
  if (!userProfile || !state.pattern) return;

  const score = userProfile.pattern_scores?.[state.pattern] || 0;

  // =====================
  // WEAK USER
  // =====================
  if (score <= -2) {
    state.hint_depth = Math.min(state.hint_depth + 2, 5);
  }

  // =====================
  // AVERAGE
  // =====================
  else if (score >= -1 && score <= 1) {
    // no change
  }

  // =====================
  // STRONG USER
  // =====================
  else if (score >= 2) {
    state.hint_depth = Math.max(state.hint_depth - 1, 1);
  }

  // =====================
  // HIGH DEPENDENCY
  // =====================
  if (userProfile.hint_dependency > 0.6) {
    state.hint_depth = Math.max(state.hint_depth - 1, 1);
  }
}

export async function runHintwisePipeline(
  { problemQuery, userAttempt, action },
  state,
  userProfile,
) {
  log("🚀 Start");
  log("Query:", problemQuery);
  log("Action:", action);

  const intent = classifyIntent(problemQuery, action);

  // =======================
  // 🔐 INIT STATE
  // =======================
  if (!state.pattern) {
    const patternData = await lockPattern(problemQuery);
    const difficultyData = analyzeDifficulty(problemQuery, patternData);

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

    state.hint_history = state.hint_history || [];

    state.hint_history.push({
      type: "SOLUTION",
      content: solution,
      step_index: state.current_step_index,
    });
    // log("Saving hint:", hint);

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
    updateUserLearning(state, userProfile, analysis);

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
        analysis.step_analysis.reached_step,
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
    state.algorithm_steps.length - 1,
  );

  applyAdaptiveHinting(state, userProfile);
  const hint = await generateHint({
    state,
    struggle,
    lastAnalysis: isAttemptFlow ? analysis : null,
    userAttempt: isAttemptFlow ? userAttempt : null,
    isAttemptFlow,
    stepIndex,
  });

  state.hint_history = state.hint_history || [];

  state.hint_history.push({
    type: isAttemptFlow ? "ATTEMPT_FEEDBACK" : "HINT",
    content: hint,
    step_index: stepIndex,
  });

  // ✅ Only move forward in normal flow
  if (!isAttemptFlow) {
    if (state.current_step_index < state.algorithm_steps.length - 1) {
      state.current_step_index += 1;
    }
  }

  updateState(state);

  // =====================
  // LEARN FROM HINT USAGE
  // =====================
  if (state.hint_usage_count > 5 && state.pattern) {
    userProfile.pattern_scores = userProfile.pattern_scores || {};

    if (!userProfile.pattern_scores[state.pattern]) {
      userProfile.pattern_scores[state.pattern] = 0;
    }

    userProfile.pattern_scores[state.pattern] -= 0.5;
  }

  log("✅ End");
  log("Time taken:", Date.now() - startTime, "ms");

  return {
    feedback: analysis?.feedback || "Here's your next hint:",
    hint,
    step_analysis: {
      reached_step: state.current_step_index,
    },
  };
}
