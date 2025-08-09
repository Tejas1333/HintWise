import React from "react";
import { useState } from 'react';

const FlashCards = ({ content, hintType }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    // The main container. Removed fixed height. It's now responsive.
    <div 
      className="w-full max-w-xl [perspective:1000px] mt-5 cursor-pointer" 
      onClick={handleFlip}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleFlip();
        }
      }}
      tabIndex={0}
      role="button"
      aria-pressed={isFlipped}
    >
      {/* This inner div handles the 3D transformation */}
      <div
        className={`relative w-full transition-transform duration-700 [transform-style:preserve-3d] ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* This is the new grid container. Both front and back faces are placed
          in the same grid cell (1x1), allowing them to stack. The parent
          grid will automatically resize to fit the tallest content.
        */}
        <div className="grid [transform-style:preserve-3d]">
          {/* Front of the card */}
          <div className="[grid-area:1/1] w-full min-h-[20rem] rounded-xl bg-blue-500 border border-slate-700 shadow-2xl flex items-center justify-center p-8 [backface-visibility:hidden]">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-semibold text-slate-200">
                {hintType} Hint
              </p>
              <p className="text-sm text-blue-200 mt-2">(Click to reveal)</p>
            </div>
          </div>

          {/* Back of the card (with responsive height) */}
          <div className="[grid-area:1/1] w-full min-h-[20rem] rounded-xl bg-gray-200 border border-cyan-400 shadow-2xl flex items-center justify-center p-8 [transform:rotateY(180deg)] [backface-visibility:hidden]">
            <p className="text-xl md:text-2xl font-medium text-slate-900 text-center">
              {content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashCards;
