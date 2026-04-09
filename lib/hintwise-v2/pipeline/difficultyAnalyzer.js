export function analyzeDifficulty(input) {
  const text = input.toLowerCase();

  let difficulty = "MEDIUM";

  if (text.includes("easy")) difficulty = "EASY";
  if (text.includes("hard") || text.includes("dp")) difficulty = "HARD";

  return {
    difficulty,
    signals: extractSignals(text),
  };
}

function extractSignals(text) {
  const signals = [];

  if (text.includes("array")) signals.push("array");
  if (text.includes("graph")) signals.push("graph");
  if (text.includes("substring")) signals.push("sliding_window");
  if (text.includes("subset")) signals.push("dp");

  return signals;
}