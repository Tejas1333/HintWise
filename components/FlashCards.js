import React from "react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";

const FlashCards = ({ content, hintType }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Define styles based on hint type for better visual distinction
  const cardStyles = {
    Slight: {
      frontBg: "bg-blue-500",
      frontBorder: "border-blue-600",
      frontText: "text-white",
      frontSubText: "text-blue-200",
      backBg: "bg-gray-100",
      backBorder: "border-gray-300",
    },
    Medium: {
      frontBg: "bg-cyan-500",
      frontBorder: "border-cyan-600",
      frontText: "text-white",
      frontSubText: "text-cyan-200",
      backBg: "bg-gray-100",
      backBorder: "border-gray-300",
    },
    Full: {
      frontBg: "bg-green-500",
      frontBorder: "border-green-600",
      frontText: "text-white",
      frontSubText: "text-green-200",
      backBg: "bg-gray-50", // Lighter background for better code readability
      backBorder: "border-green-400",
    },
  };

  const currentStyle = cardStyles[hintType] || cardStyles.Slight;
  const cardTitle = hintType === "Full" ? "Full Solution" : `${hintType} Hint`;

  return (
    <div
      className="w-full max-w-xl [perspective:1000px] mt-5 cursor-pointer group"
      onClick={handleFlip}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleFlip();
        }
      }}
      tabIndex={0}
      role="button"
      aria-pressed={isFlipped}
    >
      <div
        className={`relative w-full transition-transform duration-700 [transform-style:preserve-3d] ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        <div className="grid [transform-style:preserve-3d]">
          {/* Front of the card */}
          <div
            className={`[grid-area:1/1] w-full min-h-[20rem] rounded-xl border shadow-lg flex items-center justify-center p-8 [backface-visibility:hidden] transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.02] ${currentStyle.frontBg} ${currentStyle.frontBorder}`}
          >
            <div className="text-center">
              <p className={`text-2xl md:text-3xl font-semibold ${currentStyle.frontText}`}>
                {cardTitle}
              </p>
              <p className={`text-sm mt-2 ${currentStyle.frontSubText}`}>
                (Click to reveal)
              </p>
            </div>
          </div>

          {/* Back of the card */}
          <div
            className={`[grid-area:1/1] w-full min-h-[20rem] rounded-xl border shadow-lg flex items-center justify-center p-8 [transform:rotateY(180deg)] [backface-visibility:hidden] text-gray-800 ${currentStyle.backBg} ${currentStyle.backBorder}`}
          >
            <div className="prose max-w-none w-full">
              <ReactMarkdown
                rehypePlugins={[rehypeKatex]}
                remarkPlugins={[remarkGfm]}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashCards;