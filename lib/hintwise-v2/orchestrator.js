import { analyzeDifficulty } from "./pipeline/difficultyAnalyzer";
import { lockPattern } from "./pipeline/patternLock";
import { createInitialState, updateState } from "./pipeline/stateEngine";
import { detectStruggle } from "./pipeline/struggleDetector";
import { applyHintResistance } from "./pipeline/hintResistance";
import { generateHint } from "./pipeline/hintEngine";
import { adapt } from "./pipeline/adaptiveLayer";
import { analyzeAttempt } from "./pipeline/attemptAnalyzer";
import { classifyIntent } from "./pipeline/intentClassifier";

export async function runHintwisePipeline(input, action, state, userProfile) {
  console.log("STATE BEFORE:", state);

  const intent = classifyIntent(input);

  // 🧠 NEW: Handle user attempt
  if (action === "USER_ATTEMPT") {
    const result = await analyzeAttempt(input, state);

    state.mistake_count += 1;

    return result.feedback;
  }

  // 🧠 normal flow
  if (!state.pattern) {
    const difficulty = analyzeDifficulty(input);
    const patternData = await lockPattern(input);

    createInitialState(state, patternData, difficulty);
  } else {
    updateState(state);
  }
  adapt(state, userProfile);

  if (action === "SHOW_SOLUTION") {
    state.hint_depth = 5;
    return await generateHint(state, "HIGH", userProfile);
  }

  const struggle = detectStruggle(state);

  return await generateHint(state, struggle, userProfile);
}
