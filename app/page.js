// app/page.js
'use client'; // This component needs to be a Client Component for interactivity

import { useState } from 'react';

export default function HomePage() {
  const [problemQuery, setProblemQuery] = useState('');
  const [hintType, setHintType] = useState('slight');
  const [hintResponse, setHintResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateHint = async () => {
    setIsLoading(true);
    setError(null);
    setHintResponse(''); // Clear previous hint

    try {
      const response = await fetch('http://localhost:3000/api/generate-hint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: problemQuery, type: hintType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setHintResponse(data.hint); // Assuming the API returns { hint: "..." }

    } catch (err) {
      console.error("Failed to fetch hint:", err);
      setError(`Error: ${err.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">HintWise Prototype</h1>
        <p className="text-center text-gray-600 mb-8">Get AI-powered hints for DSA problems</p>

        <div className="mb-4">
          <label htmlFor="problemQuery" className="block text-gray-700 text-sm font-bold mb-2">
            DSA Problem Query:
          </label>
          <input
            type="text"
            id="problemQuery"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
            placeholder="e.g., 'Two Sum problem'"
            value={problemQuery}
            onChange={(e) => setProblemQuery(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="hintType" className="block text-gray-700 text-sm font-bold mb-2">
            Hint Type:
          </label>
          <select
            id="hintType"
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
            value={hintType}
            onChange={(e) => setHintType(e.target.value)}
            disabled={isLoading}
          >
            <option value="slight">Slight Hint (small nudge)</option>
            <option value="medium">Medium Hint (clearer direction)</option>
            <option value="full">Full Hint (core idea/algorithm)</option>
          </select>
        </div>

        <button
          onClick={handleGenerateHint}
          // disabled={isLoading || !problemQuery.trim()}
          className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out
             ? 'opacity-50 cursor-not-allowed' : ''}`}
            //  ${isLoading || !problemQuery.trim() this goes before question mark
        >
          {isLoading ? 'Generating Hint...' : 'Get Hint'}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {hintResponse && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Generated Hint:</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{hintResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
}
