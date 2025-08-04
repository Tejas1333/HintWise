// src/components/FlashCards.js

import React from "react";
import { useState } from 'react';

const FlashCards = ({ content, hintType }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // A good practice for accessibility: allow flipping with Enter/Space keys
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    // This is now the root element. The unnecessary outer div is gone.
    <div 
      className="w-full max-w-xl h-80 [perspective:1000px] mt-5 cursor-pointer" 
      onClick={handleFlip}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleFlip();
        }
      }}
      tabIndex={0} // Makes the div focusable
      role="button" // A-dded for accessibility
      aria-pressed={isFlipped}
    >
      <div
        className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* Front of the card (Question) */}
        <div className="absolute w-full h-full rounded-xl bg-blue-500 border border-slate-700 shadow-2xl shadow-cyan-500/10 flex items-center justify-center p-8 [backface-visibility:hidden]">
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-semibold text-slate-200">
              {hintType} Hint
            </p>
          </div>
        </div>

        {/* Back of the card (Answer) */}
        <div className="absolute w-full h-full rounded-xl bg-gray-200 border border-cyan-400 shadow-2xl shadow-cyan-500/30 flex items-center justify-center p-8 [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <p className="text-xl md:text-2xl font-medium text-slate-900 text-center">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FlashCards;