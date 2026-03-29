"use client";

import { useState } from "react";
import { Flashcard } from "@/types";
import Mermaid from "@/app/components/Mermaid";

interface FlashcardCardProps {
  flashcard: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  theme: string;
}

// Strip mermaid code blocks from the answer so the card only shows description text
export function getAnswerText(answer: string): string {
  return answer.replace(/```\s*mermaid[\s\S]*?```/gi, "").trim();
}

// Extract just the mermaid source code (if any) from the answer
export function getMermaidChart(answer: string): string | null {
  const match = answer.match(/```\s*mermaid\s*\n?([\s\S]*?)```/i);
  return match ? match[1].trim() : null;
}

export default function FlashcardCard({
  flashcard,
  isFlipped,
  onFlip,
  theme,
}: FlashcardCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const themeClasses =
    theme === "dark"
      ? "bg-gradient-to-br from-gray-700 to-gray-900 text-white"
      : "bg-gradient-to-br from-white to-gray-100 bg-opacity-30 backdrop-filter backdrop-blur-md text-black";

  const answerText = getAnswerText(flashcard.answer);
  const mermaidChart = getMermaidChart(flashcard.answer);

  const handleDiagramClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent flipping the card
    setIsModalOpen(true);
  };

  const currentThemeStr = theme === "dark" ? "dark" : "light";

  return (
    <>
      <div
        className={`w-96 h-80 p-0 rounded-lg shadow-lg cursor-pointer relative flashcard
          ${isFlipped ? "flipped" : ""}
          ${themeClasses}
          transform transition-transform duration-500 hover:scale-105
          md:w-96 md:h-80 sm:w-full sm:h-full`}
        onClick={onFlip}
        title="Click to view answer"
      >
        <div className="front absolute inset-0 flex flex-col p-6 overflow-hidden">
          <div className="font-bold text-3xl text-center mb-4 flex-shrink-0 md:text-2xl sm:text-xl h-fit w-full flex flex-col justify-center mt-2">
            Question:
          </div>
          <div className="text-xl text-center md:text-lg sm:text-base flex-grow overflow-auto w-full flex flex-col justify-center items-center pb-2 custom-scrollbar">
            <div className="my-auto">{flashcard.question}</div>
          </div>
        </div>

        <div className="back absolute inset-0 flex flex-col p-6 overflow-hidden">
          <div className="font-bold text-3xl text-center mb-4 flex-shrink-0 md:text-2xl sm:text-xl h-fit w-full flex flex-col justify-center mt-2">
            Answer:
          </div>
          <div className="text-base text-center md:text-base sm:text-base flex-grow overflow-auto w-full flex flex-col items-center pb-2 custom-scrollbar">
            <div className="w-full flex flex-col my-auto min-h-fit">
              {answerText && <div className="mb-2 whitespace-pre-wrap">{answerText}</div>}
              {mermaidChart && (
                <div 
                  className="w-full flex-shrink-0 bg-white text-black rounded p-2 mt-2 cursor-zoom-in hover:shadow-md transition-shadow relative group" 
                  onClick={handleDiagramClick}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all flex items-center justify-center rounded">
                    <span className="opacity-0 group-hover:opacity-100 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">Click to enlarge</span>
                  </div>
                  <Mermaid chart={mermaidChart} />
                </div>
              )}
              {!answerText && !mermaidChart && (
                <span className="text-gray-400 italic">See diagram below</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && mermaidChart && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b bg-gray-50 text-black">
              <h3 className="font-bold text-lg">Diagram View</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 focus:outline-none p-1 bg-gray-200 hover:bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center transition-colors font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-auto flex-grow flex items-center justify-center text-black bg-white">
              <div className="w-full h-full flex justify-center items-center">
                <Mermaid chart={mermaidChart} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
