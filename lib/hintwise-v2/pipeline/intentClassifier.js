export function classifyIntent(input) {
  input = input.toLowerCase();

  if (input.includes("solution")) return "FULL_SOLUTION";
  if (input.includes("hint")) return "NEXT_HINT";

  // 🔥 NEW
  // if (
  //   input.includes("code") ||
  //   input.includes("my approach") ||
  //   input.includes("my solution")
  // ) {
  //   return "USER_ATTEMPT";
  // }

  return "NEW_PROBLEM";
}