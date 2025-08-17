"use client";

import { useState } from "react";
import FlashCards from "@/components/FlashCards";

// NOTE: The FlashCards component is now defined directly in this file
// to resolve the import error and make the code self-contained.


export default function HomePage() {
  const [problemQuery, setProblemQuery] = useState("");
  const [initialHintType, setInitialHintType] = useState("Slight");
  const [hintResponse, setHintResponse] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 sm:p-8">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-4">
          HintWise Prototype
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Get AI-powered hints for DSA problems
        </p>

        {hintResponse.length === 0 ? (
          <div className="space-y-6">
            <div>
              <label htmlFor="problemQuery" className="block text-gray-700 text-sm font-bold mb-2">
                DSA Problem Query:
              </label>
              <input
                type="text"
                id="problemQuery"
                value={problemQuery}
                onChange={(e) => setProblemQuery(e.target.value)}
                className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 'Two Sum problem'"
              />
            </div>
            <div>
              <label htmlFor="hintType" className="block text-gray-700 text-sm font-bold mb-2">
                Initial Hint Type:
              </label>
              <select
                id="hintType"
                value={initialHintType}
                onChange={(e) => setInitialHintType(e.target.value)}
                className="shadow-sm border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Slight">Slight Hint (small nudge)</option>
                <option value="Medium">Medium Hint (clearer direction)</option>
                <option value="Full">Full Hint (core idea/algorithm)</option>
              </select>
            </div>
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out disabled:opacity-50"
              onClick={() => {
                handleGenerateHint(initialHintType)              }}
              disabled={isLoading || !problemQuery}
            >
              {isLoading ? "Generating..." : "Get First Hint"}
            </button>
          </div>
        ) : (
          <div className="text-center">
             <h2 className="text-xl font-semibold text-gray-800">{problemQuery}</h2>
          </div>
        )}

        {error && <div className="mt-4 p-3 bg-red-100 border-red-400 text-red-700 rounded-lg">{error}</div>}
        
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
                  className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg transition-colors"
                  onClick={() => handleGenerateHint("Slight")}
                >
                  Get Another Slight Hint
                </button>
                <button
                  className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-5 rounded-lg transition-colors"
                  onClick={() => handleGenerateHint("Medium")}
                >
                  Upgrade to Medium
                </button>
              </div>
            )}

            {lastHint.type === "Medium" && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                  className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-5 rounded-lg transition-colors"
                  onClick={() => handleGenerateHint("Medium")}
                >
                  Get Another Medium Hint
                </button>
                <button
                  className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-5 rounded-lg transition-colors"
                  onClick={() => handleGenerateHint("Full")}
                >
                  Upgrade to Full Solution
                </button>
              </div>
            )}

            {lastHint.type === "Full" && (
              <div className="text-center p-4 bg-green-100 text-green-800 rounded-lg">
                <p className="font-semibold">You have the full solution! Good luck with the implementation.</p>
              </div>
            )}
              <div className="text-center mt-6">
                <button 
                    onClick={handleStartOver}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                    Start a new problem
                </button>
              </div>
          </div>
        )}
      </div>
    </div>
  );
}
