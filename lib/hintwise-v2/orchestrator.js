import { analyzeDifficulty } from "./pipeline/difficultyAnalyzer";
import { lockPattern } from "./pipeline/patternLock";
import { createInitialState, updateState } from "./pipeline/stateEngine";
import { detectStruggle } from "./pipeline/struggleDetector";
import { generateHint } from "./pipeline/hintEngine";
import { adapt } from "./pipeline/adaptiveLayer";
import { analyzeAttempt } from "./pipeline/attemptAnalyzer";
import { classifyIntent } from "./pipeline/intentClassifier";

export async function runHintwisePipeline(input, action, state, userProfile) {
  console.log("STATE BEFORE:", state);

  // 🔒 Safety defaults
  state.mistake_count = state.mistake_count || 0;
  state.hint_usage_count = state.hint_usage_count || 0;
  state.current_step_index = state.current_step_index ?? 0;

  state.learning_context = state.learning_context || {
    repeated_mistakes: {},
  };

  state.attempt_history = state.attempt_history || [];

  userProfile.weak_patterns = userProfile.weak_patterns || [];
  userProfile.hint_dependency = userProfile.hint_dependency || 0;
  userProfile.success_rate = userProfile.success_rate || 0;

  const intent = classifyIntent(input);

  // =========================================================
  // 🧠 USER ATTEMPT FLOW
  // =========================================================
  if (action === "USER_ATTEMPT") {
    const analysis = await analyzeAttempt(input, state);

    console.log("ATTEMPT ANALYSIS:", analysis);

    // ✅ store latest attempt
    state.current_attempt = input;

    // ✅ store history
    state.attempt_history.push({
      code: input,
      mistake_type: analysis.mistake_type,
      step: analysis.step_analysis?.reached_step,
      timestamp: Date.now(),
    });

    // keep last 5 only (avoid memory bloat)
    if (state.attempt_history.length > 5) {
      state.attempt_history = state.attempt_history.slice(-5);
    }

    // ✅ track mistakes
    state.mistake_count += 1;

    // ✅ step tracking
    if (analysis?.step_analysis?.reached_step !== null) {
      state.current_step_index = analysis.step_analysis.reached_step;
    }

    // =====================================================
    // 🔥 LEARNING CONTEXT
    // =====================================================

    state.last_analysis = analysis;

    state.learning_context.last_mistake_type = analysis.mistake_type;
    state.learning_context.last_bug_hint = analysis.hint;

    if (analysis.mistake_type) {
      state.learning_context.repeated_mistakes[
        analysis.mistake_type
      ] =
        (state.learning_context.repeated_mistakes[
          analysis.mistake_type
        ] || 0) + 1;
    }

    // =====================================================
    // 🔥 ADAPTIVE PROFILE
    // =====================================================

    if (analysis.mistake_type === "wrong_pattern") {
      if (!userProfile.weak_patterns.includes(state.pattern)) {
        userProfile.weak_patterns.push(state.pattern);
      }
    }

    if (state.hint_usage_count > 3) {
      userProfile.hint_dependency += 1;
    }

    if (analysis.mistake_type === "none") {
      userProfile.success_rate += 1;
    }

    return analysis;
  }

  // =========================================================
  // 🧠 NORMAL FLOW
  // =========================================================

  if (!state.pattern) {
    const difficulty = analyzeDifficulty(input);
    const patternData = await lockPattern(input);

    createInitialState(state, patternData, difficulty);

    // reset per problem
    state.current_step_index = 0;
    state.learning_context = { repeated_mistakes: {} };
    state.last_analysis = null;
    state.attempt_history = [];
    state.current_attempt = null;
  } else {
    updateState(state);
  }

  adapt(state, userProfile);

  // =========================================================
  // 🎯 ACTIONS
  // =========================================================

  if (action === "SHOW_SOLUTION") {
    state.hint_depth = 5;
    return await generateHint(state, "HIGH", userProfile);
  }

  state.hint_usage_count += 1;

  const struggle = detectStruggle(state);

  return await generateHint(state, struggle, userProfile);
}