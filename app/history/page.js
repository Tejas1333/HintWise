"use client";

import { useState, useEffect } from 'react';
import FlashCards from '@/components/FlashCards';

// NOTE: A placeholder FlashCards component is defined here for completeness.
// You should replace this with your actual component if it is in a separate file.

// NEW: Accordion component to make each hint collapsible
const HintAccordion = ({ hint, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 focus:outline-none"
      >
        <span className="font-semibold text-gray-700">{`${hint.type} Hint #${index + 1}`}</span>
        {/* Chevron icon that rotates based on the open state */}
        <svg
          className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      {/* Collapsible content area */}
      {isOpen && (
        <div className="p-4 bg-white flex justify-center">
          <FlashCards content={hint.content} hintType={hint.type} />
        </div>
      )}
    </div>
  );
};

// A simple loading spinner component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-10">
    <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

// A simple error message component
const ErrorMessage = ({ message }) => (
  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
    <p className="font-bold">Error</p>
    <p>{message || "Something went wrong. Please try again later."}</p>
  </div>
);

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/history');
        if (!response.ok) {
          throw new Error('Failed to fetch history data.');
        }
        const data = await response.json();
        const sortedData = data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setHistory(sortedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-2">
            Session History
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Review your previously generated hints for all problems.
          </p>
          <div className="text-center">
             <a href="/" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                &larr; Back to Hint Generator
             </a>
          </div>
        </div>

        {isLoading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}

        {!isLoading && !error && (
          <div className="space-y-12">
            {history.length > 0 ? (
              history.map((session) => (
                <div key={session._id} className="bg-white p-6 rounded-2xl shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-6">
                    {session.problemQuery}
                  </h2>
                  <div className="space-y-4">
                    {/* UPDATED: Map to the new HintAccordion component */}
                    {session.hints.map((hint, index) => (
                      <HintAccordion key={hint.id} hint={hint} index={index} />
                    ))}
                  </div>
                   <p className="text-xs text-gray-400 text-right mt-4">
                      Saved on: {new Date(session.createdAt).toLocaleString()}
                   </p>
                </div>
              ))
            ) : (
              <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-700">No History Found</h3>
                <p className="text-gray-500 mt-2">
                  It looks like you have not saved any sessions yet. Go generate some hints!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
