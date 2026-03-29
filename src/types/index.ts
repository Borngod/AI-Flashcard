export interface Flashcard {
  question: string;
  answer: string;
}

export interface FlashcardCollection {
  id: string;
  [key: string]: any;
}

export interface GenerateFlashcardsResponse {
  flashcards: Flashcard[];
  diagram?: string | null;
  error?: string;
}

export interface ExtractTextResponse {
  text?: string;
  message?: string;
}
