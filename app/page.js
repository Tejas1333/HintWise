"use client";

import { useState } from "react";
import FlashCards from "@/components/FlashCards";

// NOTE: The FlashCards component is now defined directly in this file
// to resolve the import error and make the code self-contained.

// YouTube Icon Component
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
      d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.267,4,12,4,12,4S5.733,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.733,2,12,2,12s0,4.267,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.733,20,12,20,12,20s6.267,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.267,22,12,22,12S22,7.733,21.582,6.186z"
    />
    <path fill="#FFFFFF" d="M10,15.5l6-3.5l-6-3.5V15.5z" />
  </svg>
);


export default function HomePage() {
  const [problemQuery, setProblemQuery] = useState("");
  const [initialHintType, setInitialHintType] = useState("Slight");
  const [hintResponse, setHintResponse] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [videoSolutionUrl, setVideoSolutionUrl] = useState("");

  
  // NEW: State to hold the unique ID for the current session
  const [sessionId, setSessionId] = useState(null);

  const handleGenerateHint = async (typeToGenerate) => {
    setIsLoading(true);
    setError(null);

    if (!problemQuery) {
      setIsLoading(false);
      return;
    }

    try {
      if (hintResponse.length === 0) {
        const searchQuery = `${problemQuery} algorithm explanation`;
        const encodedQuery = encodeURIComponent(searchQuery).replace("/%20/g", "+");
        // This URL structure creates a playlist from the search query and autoplays the first video.
        const youtubeUrl = `https://www.youtube.com/results?search_query=${encodedQuery}`;
        setVideoSolutionUrl(youtubeUrl);
      }



      // Check if this is the first hint of a new session
      const currentSessionId = sessionId || Date.now().toString();
      if (!sessionId) {
        setSessionId(currentSessionId);
      }

      const hintResponseFromServer = await fetch("http://localhost:3000/api/generate-hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: problemQuery,
          type: typeToGenerate,
          hints: hintResponse,
        }),
      });

      if (!hintResponseFromServer.ok) {
        const errorData = await hintResponseFromServer.json();
        throw new Error(errorData.message || "Failed to generate hint");
      }

      const hint = await hintResponseFromServer.json();

      const newHintObject = {
        id: Date.now(),
        type: typeToGenerate,
        content: hint.hintResponse,
      };

      const updatedHints = [...hintResponse, newHintObject];
      setHintResponse(updatedHints);

      // UPDATED: Send the sessionId along with the other data
      const dbResponse = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSessionId, // <-- SEND THE SESSION ID
          problemQuery: problemQuery,
          hintResponse: updatedHints
        }),
      });
      
      if (!dbResponse.ok) {
          throw new Error("Failed to save data to the database.");
      }

      console.log("Successfully generated hint and saved to DB.");

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setHintResponse([]);
    setError(null);
    setProblemQuery("");
    setSessionId(null); // Reset the session ID for a new problem
  };

  const lastHint = hintResponse.length > 0 ? hintResponse[hintResponse.length - 1] : null;

  // ... rest of your JSX remains the same
   return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <main className="flex flex-col items-center justify-center p-4 pt-24">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-3xl border border-gray-200">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-2">
            HintWise AI
          </h1>
          <p className="text-center text-gray-500 mb-8">
            Your AI-powered guide to mastering data structures and algorithms.
          </p>

          {hintResponse.length === 0 ? (
            <div className="space-y-6">
              <div>
                <label htmlFor="problemQuery" className="block text-gray-700 text-sm font-semibold mb-2">
                  Problem Description
                </label>
                <input
                  type="text"
                  id="problemQuery"
                  value={problemQuery}
                  onChange={(e) => setProblemQuery(e.target.value)}
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow"
                  placeholder="e.g., 'Find the shortest path in a weighted graph'"
                />
              </div>
              <div>
                <label htmlFor="hintType" className="block text-gray-700 text-sm font-semibold mb-2">
                  Starting Hint Level
                </label>
                <select
                  id="hintType"
                  value={initialHintType}
                  onChange={(e) => setInitialHintType(e.target.value)}
                  className="shadow-sm border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow"
                >
                  <option value="Slight">Slight Hint (A gentle nudge)</option>
                  <option value="Medium">Medium Hint (A clear direction)</option>
                  <option value="Full">Full Hint (The core concept)</option>
                </select>
              </div>
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-200 ease-in-out disabled:opacity-50 transform hover:scale-105"
                onClick={() => handleGenerateHint(initialHintType)}
                disabled={isLoading || !problemQuery}
              >
                {isLoading ? "Thinking..." : "Get Your First Hint"}
              </button>
            </div>
          ) : (
            <div className="flex justify-center items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-800">{problemQuery}</h2>
              {videoSolutionUrl && (
                <a
                  href={videoSolutionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  aria-label="Watch video solution on YouTube"
                  title="Watch the top video explanation"
                >
                  <YouTubeIcon />
                </a>
              )}
            </div>
          )}

          {error && <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">{error}</div>}

          <div className="mt-6 w-full space-y-6">
            {hintResponse.map((hint) => (
              <div key={hint.id} className="flex justify-center w-full">
                <FlashCards content={hint.content} hintType={hint.type} />
              </div>
            ))}
          </div>

          {!isLoading && lastHint && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              {lastHint.type === "Slight" && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <button
                    className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-5 rounded-lg transition-all transform hover:scale-105"
                    onClick={() => handleGenerateHint("Slight")}
                  >
                    Another Slight Hint
                  </button>
                  <button
                    className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-5 rounded-lg transition-all transform hover:scale-105"
                    onClick={() => handleGenerateHint("Medium")}
                  >
                    Upgrade to Medium
                  </button>
                </div>
              )}

              {lastHint.type === "Medium" && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <button
                    className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-5 rounded-lg transition-all transform hover:scale-105"
                    onClick={() => handleGenerateHint("Medium")}
                  >
                    Another Medium Hint
                  </button>
                  <button
                    className="w-full sm:w-auto bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-5 rounded-lg transition-all transform hover:scale-105"
                    onClick={() => handleGenerateHint("Full")}
                  >
                    Upgrade to Full Hint
                  </button>
                </div>
              )}

              {lastHint.type === "Full" && (
                <div className="text-center p-4 bg-green-100 text-green-800 rounded-lg border border-green-200">
                  <p className="font-semibold">You have the full hint! Best of luck.</p>
                </div>
              )}
              <div className="text-center mt-6">
                <button
                  onClick={handleStartOver}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                >
                  Start a new problem
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
