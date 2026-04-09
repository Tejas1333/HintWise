export function createInitialState(state, patternData, difficultyData) {
  state.pattern = patternData.pattern;
  state.algorithm_steps = patternData.steps;
  state.current_step_index = 0;
  state.hint_depth = 1;
  state.difficulty = difficultyData.difficulty;

  state.hint_usage_count = 0;
  state.mistake_count = 0;
  state.struggle_score = 0;
}

export function updateState(state) {
  state.hint_depth = Math.min(state.hint_depth + 1, 5);
  state.hint_usage_count += 1;
}