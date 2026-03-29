import { Flashcard, GenerateFlashcardsResponse, ExtractTextResponse } from "@/types";

export interface GenerateResult {
  flashcards: Flashcard[];
  diagram: string | null;
}

export async function generateFlashcards(text: string): Promise<GenerateResult> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const data: GenerateFlashcardsResponse = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to generate flashcards");
  }

  return {
    flashcards: data.flashcards,
    diagram: data.diagram || null,
  };
}

export async function extractTextFromFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/file", {
    method: "POST",
    body: formData,
  });

  const data: ExtractTextResponse = await res.json();

  if (!res.ok || !data.text) {
    throw new Error(data.message || "Failed to extract text from file");
  }

  return data.text;
}
