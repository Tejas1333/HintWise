export function classifyIntent(input, action) {
  // ✅ Primary source (frontend)
  if (action) return action;

  // ⚠️ fallback only
  input = input.toLowerCase();

  if (input.includes("solution")) return "SHOW_SOLUTION";
  if (input.includes("hint")) return "NEXT_HINT";
  if (input.includes("user")) return "USER_ATTEMPT";

  return "NEW_PROBLEM";
}