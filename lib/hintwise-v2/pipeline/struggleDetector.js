export function detectStruggle(state) {
  if (state.hint_usage_count > 8) return "HIGH";
  if (state.hint_usage_count > 4) return "MEDIUM";
  return "LOW";
}