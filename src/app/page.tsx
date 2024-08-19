"use client";
import { useState } from "react";
import LoginSignupModal from "./components/LoginSignupModal";
import Typewriter from "typewriter-effect"; // Import typewriter effect library

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = () => {
    console.log("this has been clicked");

    setShowPopup(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-purple-800 text-white bg-big relative px-4 sm:px-8">
      {/* Floating shapes */}
      {showPopup && (
        <LoginSignupModal
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
        />
      )}

      <div className="w-full max-w-3xl p-6 sm:p-8 rounded-lg shadow-2xl bg-opacity-80 backdrop-blur-lg bg-gray-800 z-10 relative">
        <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 text-center tracking-tight">
          {/* Typewriter effect for heading */}
          <Typewriter
            options={{
              strings: [
                "AI Flashcards ⚡",
                "Your Docs to Flashcards ⚡",
                "Your Text to Flashcards ⚡",
              ],
              autoStart: true,
              loop: true,
            }}
          />
        </h1>
        <p className="text-lg sm:text-xl text-center leading-relaxed mb-6 sm:mb-10 font-light">
          {/* Use a lighter font weight */}
          Learn smarter, not harder. Turn any text or PDF into interactive
          flashcards instantly.
        </p>

        {/* Feature Highlights - More concise and impactful */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 mb-8 sm:mb-12">
          <div className="flex items-center">
            <svg
              className="w-6 h-6 text-green-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>{" "}
            <p className="text-base sm:text-lg">
              Generate flashcards from any source
            </p>
          </div>
          <div className="flex items-center">
            <svg
              className="w-6 h-6 text-green-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>{" "}
            <p className="text-base sm:text-lg">
              Customize your learning experience
            </p>
          </div>
          <div className="flex items-center">
            <svg
              className="w-6 h-6 text-green-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>{" "}
            <p className="text-base sm:text-lg">Track your progress</p>
          </div>
          <div className="flex items-center">
            <svg
              className="w-6 h-6 text-green-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>{" "}
            <p className="text-base sm:text-lg">Study anytime, anywhere</p>
          </div>
        </div>

        {/* Call to Action with enhanced text and button */}
        <div className="text-center mt-6 sm:mt-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Elevate Your Learning Game
          </h2>
          <p className="text-base sm:text-lg mb-4 sm:mb-6">
            Unlock your potential with AI-powered flashcards. Study smarter,
            achieve more.
          </p>
          <button
            onClick={handleSubmit}
            className="py-3 sm:py-4 px-6 sm:px-8 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-bold text-lg sm:text-xl shadow-lg transition duration-300"
          >
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  );
}
