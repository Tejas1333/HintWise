"use client";

import { useState } from "react";
import FlashCards from "@/components/FlashCards";

const YouTubeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    className="h-7 w-7"
  >
    <path
      fill="currentColor"
      d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.267,4,12,4,12,4S5.733,4,4.186,4.418c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.733,2,12,2,12s0,4.267,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768C5.733,20,12,20,12,20s6.267,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.267,22,12,22,12S22,7.733,21.582,6.186z"
    />
    <path fill="#FFFFFF" d="M10,15.5l6-3.5l-6-3.5V15.5z" />
  </svg>
);

export default function HomePage() {
  const [problemQuery, setProblemQuery] = useState("");
  const [hintResponse, setHintResponse] = useState([]);
  const [userAttempt, setUserAttempt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [videoSolutionUrl, setVideoSolutionUrl] = useState("");
  const [sessionId, setSessionId] = useState(null);

  const handleGenerateHint = async (action) => {
    setIsLoading(true);
    setError(null);

    if (!problemQuery) {
      setIsLoading(false);
      return;
    }

    try {
      // 🎥 YouTube link on first hint
      if (hintResponse.length === 0) {
        const searchQuery = `${problemQuery} algorithm explanation`;
        const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
          searchQuery
        )}`;
        setVideoSolutionUrl(youtubeUrl);
      }

      const currentSessionId = sessionId || Date.now().toString();
      if (!sessionId) setSessionId(currentSessionId);

      const res = await fetch("/api/generate-hint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: problemQuery,
          action,
          userAttempt,
          sessionId: currentSessionId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to generate response");
      }

      const data = await res.json();

      const newHint = {
        id: Date.now(),
        content: data.hintResponse || "No response",
      };

      setHintResponse((prev) => [...prev, newHint]);

      // clear attempt after submit
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
  };

  const hasHints = hintResponse.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <main className="flex flex-col items-center justify-center p-4 pt-24">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-3xl border border-gray-200">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-2">
            HintWise AI
          </h1>

          {!hasHints ? (
            <div className="space-y-6">
              <input
                type="text"
                value={problemQuery}
                onChange={(e) => setProblemQuery(e.target.value)}
                className="shadow-sm border border-gray-300 rounded-lg w-full py-3 px-4"
                placeholder="e.g., Find two numbers that sum to target"
              />

              <button
                onClick={() => handleGenerateHint("NEXT_HINT")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? "Thinking..." : "Start Solving"}
              </button>
            </div>
          ) : (
            <div className="flex justify-center items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-800">
                {problemQuery}
              </h2>

              {videoSolutionUrl && (
                <a href={videoSolutionUrl} target="_blank">
                  <YouTubeIcon />
                </a>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 text-red-600 bg-red-100 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* 🔥 HINTS */}
          <div className="mt-6 space-y-4">
            {hintResponse.map((hint) => (
              <FlashCards key={hint.id} content={hint.content} />
            ))}
          </div>

          {/* 🔥 USER ATTEMPT */}
          {hasHints && (
            <div className="mt-6">
              <textarea
                value={userAttempt}
                onChange={(e) => setUserAttempt(e.target.value)}
                placeholder="Write your approach or code here..."
                className="w-full p-3 border border-gray-300 rounded-lg"
              />

              <button
                onClick={() => handleGenerateHint("USER_ATTEMPT")}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded mt-2"
                disabled={isLoading}
              >
                Submit Attempt
              </button>
            </div>
          )}

          {/* 🔥 ACTION BUTTONS */}
          {hasHints && !isLoading && (
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={() => handleGenerateHint("NEXT_HINT")}
                className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-lg"
              >
                Next Hint
              </button>

              <button
                onClick={() => handleGenerateHint("SHOW_SOLUTION")}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
              >
                Show Solution
              </button>
            </div>
          )}

          {/* RESET */}
          <div className="text-center mt-6">
            <button
              onClick={handleStartOver}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Start a new problem
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}