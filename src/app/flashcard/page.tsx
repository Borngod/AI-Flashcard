"use client";

import { useEffect, useRef, useState } from "react";
import { Inter } from "@next/font/google";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/app/firebase/config.js";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config.js";
import Confetti from "react-confetti";

import { Flashcard, FlashcardCollection } from "@/types";
import { generateFlashcards, extractTextFromFile } from "@/lib/flashcard-service";
import FlashcardCard from "./components/FlashcardCard";
import FlashcardNav from "./components/FlashcardNav";
import InputForm from "./components/InputForm";
import ProgressBar from "./components/ProgressBar";
import Mermaid from "@/app/components/Mermaid";

const inter = Inter({ subsets: ["latin"] });

export default function FlashcardsGenerator() {
  const [inputText, setInputText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [diagram, setDiagram] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState("dark");
  const [showAnswer, setShowAnswer] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [collections, setCollections] = useState<FlashcardCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const [user] = useAuthState(auth);

  const isLastCard = currentPage === flashcards.length - 1 && flashcards.length > 0;

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const snapshot = await getDocs(collection(db, "collections"));
        setCollections(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (err) {
        console.error("Error fetching collections:", err);
      }
    };
    fetchCollections();
  }, []);

  useEffect(() => {
    if ("speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const handleSave = async () => {
    if (!selectedCollection) {
      alert("Please select a collection to save your flashcards.");
      return;
    }

    try {
      await addDoc(
        collection(db, "collections", selectedCollection, "flashcards"),
        { flashcards, createdAt: serverTimestamp() }
      );
      alert("Flashcards saved successfully!");
    } catch (err) {
      console.error("Error saving flashcards:", err);
    }
  };

  const handleSpeak = () => {
    if (synthRef.current && flashcards.length > 0) {
      const utterance = new SpeechSynthesisUtterance(
        flashcards[currentPage].question
      );
      synthRef.current.speak(utterance);
    }
  };

  const handleGenerate = async (text: string) => {
    setLoading(true);
    setError(null);
    setCurrentPage(0);
    setShowAnswer({});

    try {
      const result = await generateFlashcards(text);
      setFlashcards(result.flashcards);
      setDiagram(result.diagram);
    } catch (err: any) {
      console.error("Error generating flashcards:", err);
      setError(err.message || "An error occurred while generating flashcards.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (file && inputText) {
      setError("Please select either the file or text input, not both.");
      return;
    }

    if (file) {
      setLoading(true);
      try {
        const text = await extractTextFromFile(file);
        await handleGenerate(text);
      } catch (err: any) {
        setError(err.message || "An error occurred while processing the file.");
        setLoading(false);
      }
    } else if (inputText) {
      handleGenerate(inputText);
    } else {
      setError("Please provide either text input or a file.");
    }
  };

  const containerClasses =
    selectedTheme === "dark"
      ? "bg-gray-800"
      : "bg-white bg-opacity-30 backdrop-filter backdrop-blur-md";

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center text-white bg-big ${inter.className}`}
    >
      <div
        className={`w-full max-w-2xl p-6 rounded-lg shadow-2xl bg-opacity-70 backdrop-blur-lg mt-5 ${containerClasses}`}
      >
        <h1 className="text-3xl font-bold mb-6 text-center">
          AI Flashcard Generator
        </h1>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <InputForm
          inputText={inputText}
          onInputChange={setInputText}
          onFileChange={(e) => setFile(e.target.files?.[0] || null)}
          onSubmit={handleSubmit}
          onSave={handleSave}
          loading={loading}
          hasFlashcards={flashcards.length > 0}
          canSubmit={!!(file || inputText)}
          theme={selectedTheme}
          onThemeChange={(e) => setSelectedTheme(e.target.value)}
        />

        <div className="mt-6 flex flex-col items-center">
          <ProgressBar current={currentPage} total={flashcards.length} />

          {flashcards.length > 0 && (
            <FlashcardCard
              key={currentPage}
              flashcard={flashcards[currentPage]}
              isFlipped={!!showAnswer[currentPage]}
              onFlip={() =>
                setShowAnswer((prev) => ({
                  ...prev,
                  [currentPage]: !prev[currentPage],
                }))
              }
              theme={selectedTheme}
            />
          )}

          {/* Render Mermaid diagram OUTSIDE the flip card — always visible when we have one */}
          {diagram && flashcards.length > 0 && (
            <div className="w-full max-w-xl mt-4 bg-white rounded-xl shadow-lg p-4 text-black">
              <div className="text-xs font-bold text-blue-600 uppercase mb-2 tracking-widest">📊 Diagram</div>
              <Mermaid chart={diagram} />
            </div>
          )}

          {flashcards.length > 0 && (
            <>
              <FlashcardNav
                currentPage={currentPage}
                totalPages={flashcards.length}
                onPrev={() => setCurrentPage((p) => Math.max(0, p - 1))}
                onNext={() =>
                  setCurrentPage((p) => Math.min(flashcards.length - 1, p + 1))
                }
                onSpeak={handleSpeak}
                canSpeak={!!synthRef.current && flashcards.length > 0}
              />

              {isLastCard && (
                <Confetti
                  width={window.innerWidth}
                  height={window.innerHeight}
                  recycle={false}
                />
              )}
            </>
          )}

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
