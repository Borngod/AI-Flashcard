"use client";

import { FaChevronLeft, FaChevronRight, FaVolumeUp } from "react-icons/fa";

interface FlashcardNavProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onSpeak: () => void;
  canSpeak: boolean;
}

export default function FlashcardNav({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onSpeak,
  canSpeak,
}: FlashcardNavProps) {
  return (
    <div className="flex space-x-4 mt-4">
      <button
        onClick={onPrev}
        disabled={currentPage === 0}
        className={`py-2 px-4 bg-gray-700 text-white rounded-lg ${
          currentPage === 0 ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <FaChevronLeft /> Prev
      </button>

      <span className="text-gray-400">
        {currentPage + 1} / {totalPages}
      </span>

      <button
        onClick={onNext}
        disabled={currentPage === totalPages - 1}
        className={`py-2 px-4 bg-gray-700 text-white rounded-lg ${
          currentPage === totalPages - 1
            ? "opacity-50 cursor-not-allowed"
            : ""
        }`}
      >
        Next <FaChevronRight />
      </button>

      <button
        onClick={onSpeak}
        className="py-2 px-4 bg-gray-700 text-white rounded-lg cursor-pointer"
        disabled={!canSpeak}
        title="Read aloud"
      >
        <FaVolumeUp />
      </button>
    </div>
  );
}
