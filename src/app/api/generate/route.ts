import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Flashcard } from "@/types";

const MODEL_NAME = "gemini-2.5-flash";

const FLASHCARD_PROMPT = (text: string) =>
  `Generate flashcards based on the following text. If the input is just a topic name, use your knowledge to generate comprehensive flashcards about that topic.\n\n${text}\n\nStrictly adhere to this format for each flashcard:\n\n**Flashcard [number]:**\n\n* Question: [question]\n* Answer: [answer]\n\nGenerate at least 4 flashcards. For topics that involve processes, cycles, workflows, sequences, hierarchies, or relationships, you MUST include a Mermaid.js diagram in at least one flashcard answer using a \`\`\`mermaid\n[code]\n\`\`\` block. The diagram should visualize the core process or relationships. Keep diagrams concise.\n\nIMPORTANT Mermaid rules: ALWAYS wrap any text inside node labels with double quotes. For example, instead of A[Text (Info)], use A["Text (Info)"].\n\nEnsure there's a blank line between flashcards.`;

const DIAGRAM_PROMPT = (text: string) =>
  `Based on the following text, generate ONLY a valid Mermaid.js diagram that visualizes the key concepts, processes, or relationships described. Output ONLY the raw Mermaid code, nothing else. No markdown fences, no explanation, just the mermaid graph definition starting with "graph" or "flowchart" or "sequenceDiagram" etc.\n\nIMPORTANT: To prevent syntax errors, ALWAYS wrap any text inside node labels with double quotes. For example, instead of A[Text (Info)], use A["Text (Info)"].\n\nText:\n${text}`;

const DIAGRAM_DECISION_PROMPT = (text: string) =>
  `Does the following text describe or refer to a process, cycle, workflow, system architecture, sequence of steps, hierarchy, or data relationships that would benefit from a visual diagram? Even if the input is just a topic name (e.g. "nitrogen cycle", "water cycle", "software architecture"), if the topic inherently involves visual processes or relationships, reply YES. Reply with only YES or NO.\n\nText:\n${text}`;

function parseFlashcards(raw: string): Flashcard[] {
  const blocks = raw.split(/\*\*Flashcard\s+\d+[:\s]*\*\*/).filter(Boolean);

  return blocks
    .map((block) => {
      const questionMatch = block.match(/\*\s+Question:\s*(.+)/);
      const answerMatch = block.match(/\*\s+Answer:\s*([\s\S]+)/);

      if (!questionMatch || !answerMatch) return null;

      return {
        question: questionMatch[1].trim(),
        answer: answerMatch[1].trim(),
      };
    })
    .filter((card): card is Flashcard => card !== null);
}

async function askModelIfDiagramNeeded(
  genAI: GoogleGenerativeAI,
  text: string
): Promise<boolean> {
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: { temperature: 0, maxOutputTokens: 4 },
    });

    const result = await model.generateContent(DIAGRAM_DECISION_PROMPT(text));
    const answer = result.response.text().trim().toUpperCase();
    return answer.startsWith("YES");
  } catch (err) {
    console.warn("Diagram decision failed, skipping diagram:", err);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: { temperature: 1.0, maxOutputTokens: 2048 },
    });

    // Run flashcard generation and diagram decision in parallel
    const [flashcardResult, wantsDiagram] = await Promise.all([
      model.generateContent(FLASHCARD_PROMPT(text)),
      askModelIfDiagramNeeded(genAI, text),
    ]);

    if (!flashcardResult?.response?.text) {
      return NextResponse.json(
        { error: "Invalid response from Gemini AI" },
        { status: 502 }
      );
    }

    const flashcards = parseFlashcards(flashcardResult.response.text().trim());

    if (flashcards.length === 0) {
      return NextResponse.json(
        { error: "Could not parse any flashcards from the AI response" },
        { status: 422 }
      );
    }

    // Only generate diagram if the model decided it's needed
    let diagram: string | null = null;
    if (wantsDiagram) {
      try {
        const diagramModel = genAI.getGenerativeModel({
          model: MODEL_NAME,
          generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
        });
        const diagramResult = await diagramModel.generateContent(
          DIAGRAM_PROMPT(text)
        );
        let raw = diagramResult.response.text().trim();
        raw = raw.replace(/^```\s*mermaid\s*\n?/i, "").replace(/\n?```\s*$/i, "");
        if (raw.length > 10) {
          diagram = raw;
        }
      } catch (err) {
        console.warn("Diagram generation failed, skipping:", err);
      }
    }

    return NextResponse.json({ flashcards, diagram });
  } catch (error: any) {
    console.error("Error generating flashcards:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate flashcards" },
      { status: 500 }
    );
  }
}
