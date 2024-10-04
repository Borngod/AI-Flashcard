

# AI Flashcards Generator

Welcome to the **AI Flashcards Generator**! This is a dynamic tool that creates flashcards based on user text inputs or by uploading documents. It uses AI to automatically generate flashcards with key points, helping you study or revise faster. The project is built with **Next.js**, **Gemini API**, and features **Speech Synthesis** for auditory flashcard reviews.

## Features

- **AI-Powered Flashcard Generation**: Automatically generate flashcards from user text inputs or uploaded documents.
- **Document Parsing**: Upload documents (PDF, DOCX, etc.), and the AI will extract relevant information to create flashcards.
- **Speech Synthesis**: Listen to the flashcards being read aloud for a hands-free learning experience.
- **User-Friendly Interface**: Simple, clean UI for easy navigation and interaction.

## Technologies Used

- **Frontend**: Next.js (React-based framework for server-side rendering)
- **AI Integration**: Gemini API for generating flashcards and analyzing text
- **Speech Synthesis**: Built-in browser API for reading out flashcards
- **Document Parser**: Parsing functionality for document uploads (e.g., PDF, DOCX files)
- **Other Dependencies**: List any other libraries or frameworks used (e.g., Tailwind CSS, etc.)

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/Borngod/ai-flashcards-generator.git
    ```

2. Navigate into the project directory:
    ```bash
    cd ai-flashcards-generator
    ```

3. Install the dependencies:
    ```bash
    npm install
    ```

4. Add your Gemini API key to your environment variables:
    ```bash
    GEMINI_API_KEY=your-api-key
    ```

5. Run the development server:
    ```bash
    npm run dev
    ```

## Usage

- **Text Input**: Type or paste text into the input box, and the AI will generate flashcards based on the key points.
- **Document Upload**: Upload a document (PDF, DOCX, etc.), and the system will parse the document and generate flashcards.
- **Speech Synthesis**: Click on the "Listen" button to have the flashcards read aloud to you.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests to improve the project.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
