"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";

const FlashCards = ({ content, hintType, title }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => setIsFlipped(!isFlipped);

  const isFullSolution = title === "Full Solution";

  // =========================
  // 🔥 PARSE FULL SOLUTION
  // =========================
  let parsed = null;

  if (isFullSolution) {
    try {
      parsed =
        typeof content === "string" ? JSON.parse(content) : content;
    } catch {
      parsed = null;
    }
  }

  return (
    <div
      className="w-full max-w-3xl mt-5 cursor-pointer [perspective:1000px]"
      onClick={handleFlip}
    >
      <div
        className={`relative w-full transition-transform duration-500 [transform-style:preserve-3d] ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* ================= FRONT ================= */}
        <div className="absolute inset-0 w-full rounded-xl border shadow-lg flex items-center justify-center p-6 bg-blue-500 text-white [backface-visibility:hidden]">
          <div className="text-center">
            <p className="text-xl font-semibold">
              {title || "Hint"}
            </p>
            <p className="text-sm mt-2 opacity-80">
              (Click to reveal)
            </p>
          </div>
        </div>

        {/* ================= BACK ================= */}
        <div className="w-full rounded-xl border shadow-lg p-6 bg-white text-gray-800 [transform:rotateY(180deg)] [backface-visibility:hidden]">

          {/* 🔥 FULL SOLUTION VIEW */}
          {isFullSolution && parsed ? (
            <div className="space-y-4 text-sm leading-relaxed break-words">

              {parsed.approach && (
                <div>
                  <h3 className="font-semibold text-blue-600">🧠 Approach</h3>
                  <p>{parsed.approach}</p>
                </div>
              )}

              {parsed.intuition && (
                <div>
                  <h3 className="font-semibold text-purple-600">💡 Intuition</h3>
                  <p>{parsed.intuition}</p>
                </div>
              )}

              {parsed.code && (
                <div>
                  <h3 className="font-semibold text-green-600">💻 Code</h3>
                  <pre className="bg-white text-black p-3 rounded text-sm whitespace-pre-wrap break-words">
                    <code>{parsed.code}</code>
                  </pre>
                </div>
              )}

              {parsed.pseudocode && (
                <div>
                  <h3 className="font-semibold text-indigo-600">🧾 Pseudocode</h3>
                  <pre className="bg-gray-100 p-3 rounded whitespace-pre-wrap">
                    {parsed.pseudocode}
                  </pre>
                </div>
              )}

              {(parsed.time_complexity || parsed.space_complexity) && (
                <div className="flex gap-4 flex-wrap">
                  {parsed.time_complexity && (
                    <span className="bg-yellow-100 px-3 py-1 rounded">
                      ⏱ {parsed.time_complexity}
                    </span>
                  )}
                  {parsed.space_complexity && (
                    <span className="bg-orange-100 px-3 py-1 rounded">
                      📦 {parsed.space_complexity}
                    </span>
                  )}
                </div>
              )}

              {parsed.edge_cases?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-red-500">⚠️ Edge Cases</h3>
                  <ul className="list-disc ml-5">
                    {parsed.edge_cases.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}

              {parsed.common_mistakes?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700">
                    🚫 Common Mistakes
                  </h3>
                  <ul className="list-disc ml-5">
                    {parsed.common_mistakes.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            // 🔥 NORMAL HINT VIEW
            <div className="prose prose-sm max-w-none break-words whitespace-normal leading-relaxed">
              <ReactMarkdown
                rehypePlugins={[rehypeKatex]}
                remarkPlugins={[remarkGfm]}
                components={{
                  p({ children }) {
                    return <p className="mb-2">{children}</p>;
                  },
                  code({ inline, children }) {
                    return inline ? (
                      <code className="bg-gray-200 px-1 rounded">
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-white text-black p-3 rounded text-sm whitespace-pre-wrap break-words">
                        <code>{children}</code>
                      </pre>
                    );
                  },
                }}
              >
                {typeof content === "string"
                  ? content
                  : JSON.stringify(content, null, 2)}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashCards;