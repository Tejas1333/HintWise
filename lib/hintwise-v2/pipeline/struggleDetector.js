export function detectStruggle(state) {
  if (state.hint_usage_count > 6) return "HIGH";
  if (state.hint_usage_count > 3) return "MEDIUM";
  return "LOW";
}