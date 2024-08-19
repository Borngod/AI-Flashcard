"use client";
import { useEffect, useRef, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaSave,
  FaSpinner,
  FaVolumeUp,
} from "react-icons/fa";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Confetti from "react-confetti";
import { Inter } from "@next/font/google";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/app/firebase/config.js";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config.js";
import { useRouter } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

// Constants for Gemini AI
const MODEL_NAME = "gemini-1.5-flash";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;

// Enhanced prompt for more consistent flashcard generation
const generateFlashcards = async (text: string) => {
  try {
    const generationConfig = {
      temperature: 1.0,
      maxOutputTokens: 2048,
    };
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: generationConfig,
    });

    const prompt = `Generate flashcards based on the following text:\n\n${text}\n\nStrictly adhere to this format for each flashcard:\n\n**Flashcard [number]:**\n\n* Question: [question]\n* Answer: [answer]\n\nEnsure there's a blank line between flashcards.`;

    const results = await model.generateContent(prompt);

    // Handle potential errors in the response
    if (!results || !results.response || !results.response.text) {
      throw new Error("Invalid response from Gemini AI");
    }

    const flashcards = results.response.text().trim();
    return flashcards;
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw error;
  }
};

export default function FlashcardsGenerator() {
  const [inputText, setInputText] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [flashcards, setFlashcards] = useState<
    { question: string; answer: string }[]
  >([]);
  const [selectedTheme, setSelectedTheme] = useState("dark"); // State for theme
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const [showAnswer, setShowAnswer] = useState<{ [key: number]: boolean }>({});
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(0); // New state for current page

  const [collections, setCollections] = useState<{ id: string; [key: string]: any }[]>([]);
  const [selectedCollection, setSelectedCollection] = useState(null);

  const [user] = useAuthState(auth);
  const router = useRouter();

  // if (!user){
  //   router.push("/")
  // }

  useEffect(() => {
    // Fetch collections from Firestore when the component mounts
    const fetchCollections = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "collections"));
        const collectionsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCollections(collectionsData);
      } catch (error) {
        console.error("Error fetching collections:", error);
        // Handle error (e.g., display an error message to the user)
      }
    };
    fetchCollections();
  }, []);

  const handleSaveFlashcards = async () => {
    if (!selectedCollection) {
      // Handle case where no collection is selected
      alert("Please select a collection to save your flashcards.");
      return;
    }

    try {
      // Save flashcards to the selected collection in Firestore
      await addDoc(
        collection(db, "collections", selectedCollection, "flashcards"),
        {
          flashcards,
          createdAt: serverTimestamp(),
        }
      );

      // Optionally, update the collections state or provide feedback to the user
      alert("Flashcards saved successfully!");
    } catch (error) {
      console.error("Error saving flashcards:", error);
      // Handle error
    }
  };

  useEffect(() => {
    // Show confetti when the user reaches the last flashcard
    if (currentPage === flashcards.length - 1 && flashcards.length > 0) {
      setShowConfetti(true);
    } else {
      setShowConfetti(false);
    }
  }, [currentPage, flashcards.length]);
  // ... (handleFileUpload, generateFlashcardsFromGemini, toggleAnswer functions)
  useEffect(() => {
    // Initialize the SpeechSynthesis object when the component mounts
    if ("speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const handleSpeak = () => {
    if (synthRef.current && flashcards.length > 0) {
      const utterance = new SpeechSynthesisUtterance(
        flashcards[currentPage].question
      );
      synthRef.current.speak(utterance);
    }
  };

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTheme(event.target.value);
  };

  const handlePrevClick = () => {
    setCurrentPage((prevPage) => Math.max(0, prevPage - 1));
  };

  const handleNextClick = () => {
    setCurrentPage((prevPage) => Math.min(flashcards.length - 1, prevPage + 1));
  };

  // Handle PDF file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
    setFile(selectedFile);
  };

  // Function to generate flashcards - enhanced for robustness
  const generateFlashcardsFromGemini = async (text: string) => {
    setLoading(true);
    setError(null);

    try {
      const flashcardsText = await generateFlashcards(text);
      console.log(flashcardsText);

      // Split by double newlines to separate flashcards
      const flashcardBlocks = flashcardsText.split("\n\n");

      const flashcardPairs = flashcardBlocks
        .map((block) => {
          // Use a more flexible approach to extract question and answer
          const questionMatch = block.match(/\* Question: (.+)/);
          const answerMatch = block.match(/\* Answer: (.+)/);

          if (!questionMatch || !answerMatch) {
            console.warn("Skipping invalid flashcard block:", block);
            return null;
          }

          const question = questionMatch[1].trim();
          const answer = answerMatch[1].trim();

          return { question, answer };
        })
        .filter((pair): pair is { question: string; answer: string } => pair !== null); // Explicit type guard

    setFlashcards(flashcardPairs as { question: string; answer: string }[]); // Type assertion for extra safety
    } catch (error) {
      console.error("Error generating flashcards:", error);
      setError("An error occurred while generating flashcards.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // If both file and text are provided, inform the user and prevent submission
    if (file && inputText) {
      setError("Please select either the file or text input, not both.");
      return;
    }

    // If only file is provided, process the file
    if (file) {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/file", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        if (result.text) {
          generateFlashcardsFromGemini(result.text);
        } else {
          console.error("Failed to extract text from file.");
          setError("Failed to extract text from file.");
        }
      } catch (error) {
        console.error("Error uploading and extracting PDF:", error);
        setError("An error occurred while processing the PDF.");
      } finally {
        setLoading(false);
      }
    }
    // If only input text is provided, process the text
    else if (inputText) {
      generateFlashcardsFromGemini(inputText);
    } else {
      setError("Please provide either text input or a file.");
    }
  };

  // Toggle the visibility of the answer for a specific flashcard
  const toggleAnswer = (index: number) => {
    setShowAnswer((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center text-white bg-big ${inter.className}`}
    >
      <div
        className={`w-full max-w-2xl p-6 rounded-lg shadow-2xl bg-opacity-70 backdrop-blur-lg mt-5 ${
          selectedTheme === "dark"
            ? "bg-gray-800"
            : "bg-white bg-opacity-30 backdrop-filter backdrop-blur-md"
        }`}
      >
        <h1 className="text-3xl font-bold mb-6 text-center">
          AI Flashcard Generator⚡
        </h1>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="mb-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text manually..."
            className={`w-full p-4 mb-2 border-none rounded-lg ${
              selectedTheme === "dark"
                ? "bg-gray-800 text-gray-200"
                : "bg-white bg-opacity-30 text-gray-900 backdrop-filter backdrop-blur-md"
            }`}
            rows={4}
          />

          <div className="my-4">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-200
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-gray-800 file:text-gray-200
              hover:file:bg-gray-700"
            />
          </div>

          <div className="flex items-center justify">
            <button
              type="button"
              onClick={handleSaveFlashcards}
              className={`py-2 px-4 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 transition duration-300 ml-2 mr-2 relative  ${
                flashcards.length === 0 ? "cursor-not-allowed opacity-50" : ""
              }`}
              disabled={flashcards.length === 0}
            >
              <span className="flex justify-center items-center">
                <FaSave className="mr-2" /> Save Collection
              </span>
            </button>

            <button
              type="submit"
              className={`py-2 px-4 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 transition duration-300 ${
                loading || (!file && !inputText)
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
              disabled={loading || (!file && !inputText)}
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
              value={selectedTheme}
              onChange={handleThemeChange}
              className="w-full p-2 border rounded-lg bg-gray-700 text-white"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </form>

        <div className="mt-6 flex flex-col items-center">
          {flashcards.length > 0 && (
            <div className="w-64 bg-gray-200 rounded-full h-2.5 mb-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                style={{
                  width: `${((currentPage + 1) / flashcards.length) * 100}%`,
                }}
              ></div>
            </div>
          )}

          {flashcards.length > 0 && (
            <div
              key={currentPage}
              className={`w-96 h-96 p-11 rounded-lg shadow-lg cursor-pointer relative flashcard
      ${showAnswer[currentPage] ? "flipped" : ""}
      ${
        selectedTheme === "dark"
          ? "bg-gradient-to-br from-gray-700 to-gray-900 text-white"
          : "bg-gradient-to-br from-white to-gray-100 bg-opacity-30 backdrop-filter backdrop-blur-md text-black"
      } transform transition-transform duration-500 hover:scale-105
      md:w-96 md:h-80 sm:w-full sm:h-full`} // Added responsive width and height for mobile
              onClick={() => toggleAnswer(currentPage)}
              title="Click to view answer"
            >
              <div className="front absolute inset-0 flex flex-col justify-center items-center p-8">
                <div className="font-bold text-3xl text-center mb-4 md:text-2xl sm:text-xl">
                  Question:
                </div>
                <div className="text-xl text-center md:text-lg sm:text-base">
                  {flashcards[currentPage].question}
                </div>
              </div>

              <div className="back absolute inset-0 flex flex-col justify-center items-center p-6">
                <div className="font-bold text-3xl text-center mb-4 md:text-2xl sm:text-xl">
                  Answer:
                </div>
                <div className="text-xl text-center md:text-lg sm:text-base">
                  {flashcards[currentPage].answer}
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-4 mt-4">
            <button
              onClick={handlePrevClick}
              disabled={currentPage === 0}
              className={`py-2 px-4 bg-gray-700 text-white rounded-lg ${
                currentPage === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <FaChevronLeft /> Prev
            </button>
            <span className="text-gray-400">
              {currentPage + 1} / {flashcards.length}
            </span>
            <button
              onClick={handleNextClick}
              disabled={currentPage === flashcards.length - 1}
              className={`py-2 px-4 bg-gray-700 text-white rounded-lg ${
                currentPage === flashcards.length - 1
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              Next <FaChevronRight />
            </button>
            {showConfetti && (
              <Confetti
                width={window.innerWidth}
                height={window.innerHeight}
                recycle={false}
              />
            )}

            <button
              onClick={handleSpeak}
              className="py-2 px-4 bg-gray-700 text-white rounded-lg cursor-pointer"
              disabled={!synthRef.current || flashcards.length === 0}
              title="read aloud"
            >
              <FaVolumeUp />
            </button>
          </div>

          {flashcards.length === 0 && (
            <div className="text-gray-400 mt-5">
              No flashcards generated yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
