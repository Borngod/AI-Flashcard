"use client"
import { useState } from "react";
import Modal from "react-modal";
import {
  useCreateUserWithEmailAndPassword,
  useSignInWithEmailAndPassword,
} from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config.js";
import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa";

export default function LoginSignupModal({ isOpen, onClose }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Rename one of the 'loading' variables to avoid conflict
  const [createUserWithEmailAndPassword, user, isCreatingUser, signUpError] =
    useCreateUserWithEmailAndPassword(auth);
  const [signInWithEmailAndPassword, _, isSigningIn, signInError] =
    useSignInWithEmailAndPassword(auth);

  const [formError, setFormError] = useState(null);
  const router = useRouter();

  // Combine loading states for a unified loading indicator
  const loading = isCreatingUser || isSigningIn; 

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setFormError(null); 

    // Basic input validation
    if (!email || !password) {
      setFormError("Please fill in all fields.");
      return; 
    }

    if (isLoginMode) {
      try {
        // Introduce a delay to showcase the preloader (optional)
        await new Promise((resolve) => setTimeout(resolve, 500)); 

        await signInWithEmailAndPassword(email, password);
        setEmail("");
        setPassword("");
        router.push("/flashcard"); 
      } catch (e) {
        console.error("Firebase signin error:", e);
        setFormError(e.message); 
      }
    } else {
      try {
        // Introduce a delay to showcase the preloader (optional)
        await new Promise((resolve) => setTimeout(resolve, 500)); 

        await createUserWithEmailAndPassword(email, password);
        setEmail("");
        setPassword("");
        router.push("/flashcard");
      } catch (e) {
        console.error("Firebase signup error:", e);
        setFormError(e.message);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
        {isLoginMode ? "Welcome Back!" : "Create an Account"}
      </h2>

      {/* Loading indicator with FaSpinner */}
      {loading && (
        <div className="flex justify-center items-center mb-4">
          <FaSpinner className="animate-spin h-8 w-8 text-blue-500" /> 
        </div>
      )}

      {formError && <p className="text-red-500 mb-2">{formError}</p>}

      <form onSubmit={handleFormSubmit}>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" 
            required
          />
        </div>

        {/* Conditional rendering for signup mode */}
        {isLoginMode && (
          <div className="mb-4 text-right">
            <a
              href="#"
              className="text-blue-500 hover:underline font-medium"
            >
              Forgot password?
            </a>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {isLoginMode ? "Sign In" : "Sign Up"}
        </button>

        <p className="mt-4 text-center text-gray-600">
          {isLoginMode
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <a
            href="#"
            className="text-blue-500 hover:underline font-medium"
            onClick={() => setIsLoginMode(!isLoginMode)}
          >
            {isLoginMode ? "Sign Up" : "Sign In"}
          </a>
        </p>
      </form>
    </Modal>
  );
}