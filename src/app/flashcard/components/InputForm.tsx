"use client";

import { FaSave, FaSpinner } from "react-icons/fa";

interface InputFormProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onSave: () => void;
  loading: boolean;
  hasFlashcards: boolean;
  canSubmit: boolean;
  theme: string;
  onThemeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function InputForm({
  inputText,
  onInputChange,
  onFileChange,
  onSubmit,
  onSave,
  loading,
  hasFlashcards,
  canSubmit,
  theme,
  onThemeChange,
}: InputFormProps) {
  const textareaClasses =
    theme === "dark"
      ? "bg-gray-800 text-gray-200"
      : "bg-white bg-opacity-30 text-gray-900 backdrop-filter backdrop-blur-md";

  return (
    <form onSubmit={onSubmit} className="mb-4">
      <textarea
        value={inputText}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="Enter text manually..."
        className={`w-full p-4 mb-2 border-none rounded-lg ${textareaClasses}`}
        rows={4}
      />

      <div className="my-4">
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={onFileChange}
          className="block w-full text-sm text-gray-200
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-gray-800 file:text-gray-200
            hover:file:bg-gray-700"
        />
      </div>

      <div className="flex items-center">
        <button
          type="button"
          onClick={onSave}
          className={`py-2 px-4 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 transition duration-300 ml-2 mr-2 relative ${
            !hasFlashcards ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={!hasFlashcards}
        >
          <span className="flex justify-center items-center">
            <FaSave className="mr-2" /> Save Collection
          </span>
        </button>

        <button
          type="submit"
          className={`py-2 px-4 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 transition duration-300 ${
            loading || !canSubmit ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={loading || !canSubmit}
        >
          {loading ? (
            <FaSpinner className="animate-spin" />
          ) : (
            "Generate Flashcards"
          )}
        </button>
      </div>

      <div className="my-4 w-60">
        <label htmlFor="theme" className="block text-sm font-medium mb-2">
          Theme:
        </label>
        <select
          id="theme"
          value={theme}
          onChange={onThemeChange}
          className="w-full p-2 border rounded-lg bg-gray-700 text-white"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
    </form>
  );
}
