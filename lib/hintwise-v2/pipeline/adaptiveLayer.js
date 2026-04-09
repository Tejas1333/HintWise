export function adapt(state, userProfile) {
  if (!userProfile.weak_patterns) return;

  if (userProfile.weak_patterns.includes(state.pattern)) {
    state.hint_depth = Math.max(1, state.hint_depth - 1);
  }
}