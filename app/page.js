"use client";

import { useState } from "react";
import FlashCards from "@/components/FlashCards";

const YouTubeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    className="h-7 w-7 bg-black"
  >
    <path
      fill="currentColor"
      d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.267,4,12,4,12,4S5.733,4,4.186,4.418c-0.86,0.23-1.538,0.908,1.768,1.768C2,7.733,2,12,2,12s0,4.267,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768C5.733,20,12,20,12,20s6.267,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.267,22,12,22,12S22,7.733,21.582,6.186z"
    />
    <path fill="#FFFFFF" d="M10,15.5l6-3.5l-6-3.5V15.5z" />
  </svg>
);

function formatFullSolution(data) {
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return `📘 FULL SOLUTION\n\n${data}`;
    }
  }

  return `
📘 FULL SOLUTION

🧠 Approach:
${data.approach || ""}

💡 Intuition:
${data.intuition || ""}

💻 Code:
${
  typeof data.code === "string" ? data.code : JSON.stringify(data.code, null, 2)
}

🧾 Pseudocode:
${data.pseudocode || ""}

⏱ Time Complexity:
${data.time_complexity || ""}

📦 Space Complexity:
${data.space_complexity || ""}

⚠️ Edge Cases:
${(data.edge_cases || []).join(", ")}

🚫 Common Mistakes:
${(data.common_mistakes || []).join(", ")}
`;
}

export default function HomePage() {
  const [problemQuery, setProblemQuery] = useState("");
  const [hintResponse, setHintResponse] = useState([]);
  const [userAttempt, setUserAttempt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [videoSolutionUrl, setVideoSolutionUrl] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isSolutionShown, setIsSolutionShown] = useState(false);

  // 🔥 TEMP USER (replace with auth later)
  const userId = "user_123";

  const handleGenerateHint = async (action) => {
    setIsLoading(true);
    setError(null);

    if (!problemQuery) {
      setIsLoading(false);
      return;
    }

    try {
      // 🎥 YouTube suggestion (only first time)
      if (hintResponse.length === 0) {
        const searchQuery = `${problemQuery} algorithm explanation`;
        const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
          searchQuery,
        )}`;
        setVideoSolutionUrl(youtubeUrl);
      }

      const currentSessionId = sessionId || Date.now().toString();
      if (!sessionId) setSessionId(currentSessionId);

      const res = await fetch("/api/session/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          userId,
          problemQuery,
          userAttempt,
          action,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

      const response = data.data;
      const history = data.history;

      if (history && history.length > 0) {
        setHintResponse(
          history.map((h) => ({
            id: Math.random(),
            title: h.type,
            content:
              h.type === "SOLUTION" ? formatFullSolution(h.content) : h.content,
          })),
        );
      }

      let content = "";

      // ✅ FULL SOLUTION
      if (response?.type === "FULL_SOLUTION") {
        content = formatFullSolution(response.data);
        setIsSolutionShown(true);
      }

      // ✅ NORMAL HINT FLOW
      else if (response?.feedback) {
        content = `🧠 ${response.feedback}`;

        if (response.hint) {
          content += `\n\n💡 Hint: ${response.hint}`;
        }

        if (
          response.step_analysis &&
          response.step_analysis.reached_step !== undefined
        ) {
          content += `\n\n📍 Step: ${response.step_analysis.reached_step}`;
        }
      } else {
        content = "No response";
      }

      setHintResponse((prev) => [
        ...prev,
        {
          id: Date.now(),
          title: "Hint",
          content,
        },
      ]);

      if (action === "USER_ATTEMPT") {
        setUserAttempt("");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setHintResponse([]);
    setProblemQuery("");
    setUserAttempt("");
    setSessionId(null);
    setError(null);
    setVideoSolutionUrl("");
    setIsSolutionShown(false);
  };

  const hasHints = hintResponse.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <main className="flex flex-col items-center justify-center p-4 pt-24">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-3xl border border-gray-200">
          <h1 className="text-3xl font-bold text-center mb-4">HintWise AI</h1>

          {!hasHints ? (
            <div className="space-y-6">
              <input
                type="text"
                value={problemQuery}
                onChange={(e) => setProblemQuery(e.target.value)}
                className="border rounded-lg w-full py-3 px-4 bg-black text-white"
                placeholder="e.g., Two Sum"
              />

              <button
                onClick={() => handleGenerateHint("NEXT_HINT")}
                className="w-full bg-blue-600 text-white py-3 rounded-lg"
              >
                {isLoading ? "Thinking..." : "Start Solving"}
              </button>
            </div>
          ) : (
            <div className="flex justify-center items-center gap-3">
              <h2 className="text-lg font-semibold">{problemQuery}</h2>

              {videoSolutionUrl && (
                <a href={videoSolutionUrl} target="_blank">
                  <YouTubeIcon />
                </a>
              )}
            </div>
          )}

          {error && <div className="mt-4 text-red-600">{error}</div>}

          <div className="mt-6 space-y-4">
            {hintResponse.map((hint) => (
              <FlashCards
                key={hint.id}
                title={hint.title}
                content={hint.content}
              />
            ))}
          </div>

          {hasHints && !isSolutionShown && (
            <div className="mt-6">
              <textarea
                value={userAttempt}
                onChange={(e) => setUserAttempt(e.target.value)}
                placeholder="Write your approach/code..."
                className="w-full p-3 border rounded-lg bg-black text-white"
              />

              <button
                onClick={() => handleGenerateHint("USER_ATTEMPT")}
                className="bg-purple-600 text-white px-4 py-2 rounded mt-2"
              >
                Submit Attempt
              </button>
            </div>
          )}

          {hasHints && !isSolutionShown && (
            <div className="mt-6 flex gap-4 justify-center">
              <button
                onClick={() => handleGenerateHint("NEXT_HINT")}
                className="bg-sky-500 text-white px-4 py-2 rounded"
              >
                Next Hint
              </button>

              <button
                onClick={() => handleGenerateHint("SHOW_SOLUTION")}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Show Solution
              </button>
            </div>
          )}

          <div className="text-center mt-6">
            <button onClick={handleStartOver} className="text-gray-500 text-sm">
              Start New Problem
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
