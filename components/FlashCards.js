"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";

const FlashCards = ({ content, hintType, title }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // 🎨 Styles
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
      backBg: "bg-gray-50",
      backBorder: "border-green-400",
    },
  };

  const currentStyle = cardStyles[hintType] || cardStyles.Slight;

  const cardTitle =
    title || (hintType === "Full" ? "Full Solution" : `${hintType} Hint`);

  return (
    <div
      className="w-full [perspective:1000px] mt-5 cursor-pointer group"
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

          {/* 🔵 FRONT */}
          <div
            className={`[grid-area:1/1] w-full min-h-[12rem] rounded-xl border shadow-lg flex items-center justify-center p-6 [backface-visibility:hidden] transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.02] ${currentStyle.frontBg} ${currentStyle.frontBorder}`}
          >
            <div className="text-center">
              <p className={`text-xl md:text-2xl font-semibold ${currentStyle.frontText}`}>
                {cardTitle}
              </p>
              <p className={`text-sm mt-2 ${currentStyle.frontSubText}`}>
                (Click to reveal)
              </p>
            </div>
          </div>

          {/* 🟢 BACK (FULL HEIGHT, NO SCROLL, RESPONSIVE) */}
          <div
            className={`[grid-area:1/1] w-full rounded-xl border shadow-lg p-6 [transform:rotateY(180deg)] [backface-visibility:hidden] text-gray-800 flex flex-col items-start justify-start ${currentStyle.backBg} ${currentStyle.backBorder}`}
          >
            <div className="w-full">
              <div className="prose prose-sm max-w-none break-words whitespace-pre-wrap">
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
    </div>
  );
};

export default FlashCards;