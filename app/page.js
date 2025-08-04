'use client'; 

import { useState } from 'react';

const hintsList = [

]

export default function HomePage() {

  const [problemQuery, setProblemQuery] = useState('');
  const [invalidParameters, setInvalidParameters] = useState(false)
  const [hintType, setHintType] = useState('slight');
  const [hintResponse, setHintResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cards, setCards] = useState(hintsList)
  const [isFlipped, setIsFlipped] = useState(false)

  // const handleFlipped = async () => {
  //   setIsFlipped(!isFlipped)
  // }


  const handleGenerateHint = async () => {
    setHintResponse('')
    setIsLoading(true)
    setError(null)

    if(!problemQuery || !hintType)
    {
      setInvalidParameters(true)
    }

    try{
      const response = await  fetch('http://localhost:3000/api/generate-hint', {
      method : 'POST',
      headers : {'Content-Type' : 'application/json' },
      body : JSON.stringify({query: problemQuery, type: hintType})
    } )

    if(!response.ok){
      const errorData = await response.json()
      throw new Error(errorData.message)
    }
    const hint = await response.json()
    
     setHintResponse(hint.hintResponse)

    console.log("Generate Hint button was clicked!");
    } catch(error){
      setError(error)
    } finally {
      setIsLoading(false)
    }
    
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-4/5">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">HintWise Prototype</h1>
        <p className="text-center text-gray-600 mb-8">Get AI-powered hints for DSA problems</p>

        <div className="mb-4">
          <label htmlFor="problemQuery" className="block text-gray-700 text-sm font-bold mb-2">
            DSA Problem Query:
          </label>
          <input
            type="text"
            id="problemQuery"
            value={problemQuery}
            onChange={(e) => {setProblemQuery(e.target.value)}}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
            placeholder="e.g., 'Two Sum problem'"

          />
        </div>

        <div className="mb-6">
          <label htmlFor="hintType" className="block text-gray-700 text-sm font-bold mb-2">
            Hint Type:
          </label>
          <select
            id="hintType"
            value={hintType}
            onChange={(e) => {setHintType(e.target.value)}}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"

          >
            <option value="slight">Slight Hint (small nudge)</option>
            <option value="medium">Medium Hint (clearer direction)</option>
            <option value="full">Full Hint (core idea/algorithm)</option>
          </select>
        </div>

        

        {isLoading ? 
          <button
          className={`w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Generating Hint 
        </button> :
        <button
          className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handleGenerateHint}
        >
          Get Hint
        </button>
        }

        {/* --- Conditional Rendering for Error and Hint --- */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {invalidParameters && 
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h2 className="text-lg  text-red-500 mb-2">Please Enter query and hint!!!</h2>
          </div>
        }

        {hintResponse &&  (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Generated Hint:</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{hintResponse}</p>
          </div>
        )}

      {/* Flashcard container with perspective for 3D effect */}
      {/* <div className="w-full max-w-xl h-80 [perspective:1000px]"> */}
        {/* The card itself, which handles the flip animation */}
        {/* <div
          className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
          onClick={handleFlip}
        > */}
          {/* Front of the card (Question) */}
          {/* <div className="absolute w-full h-full rounded-xl bg-slate-800 border border-slate-700 shadow-2xl shadow-cyan-500/10 flex items-center justify-center p-8 [backface-visibility:hidden]">
            <p className="text-2xl md:text-3xl font-semibold text-slate-200">{currentCard.question}</p>
          </div> */}

          {/* Back of the card (Answer) */}
          {/* <div className="absolute w-full h-full rounded-xl bg-cyan-500 border border-cyan-400 shadow-2xl shadow-cyan-500/30 flex items-center justify-center p-8 [transform:rotateY(180deg)] [backface-visibility:hidden]">
            <p className="text-xl md:text-2xl font-medium text-slate-900">{currentCard.answer}</p>
          </div> */}
        {/* </div> */}
      {/* </div> */}
      </div>
    </div>
  );
}
