import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { parseOfficeAsync } from "officeparser";
import os from "os";

// Use the system's temp directory provided by Vercel or local system
const tempDir = os.tmpdir() + "/officeParserTemp/tempfiles";

export async function POST(req: NextRequest) {
  console.log("API route /api/upload was hit");

  try {
    // Parse the formData from the request body
    const formData = await req.formData();
    const file = formData.get("file");

    // Check if file exists and is of correct type
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { message: "No file uploaded or invalid file type" },
        { status: 400 }
      );
    }

    // Ensure the required directories exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true }); // Create the required temp directory structure
    }

    // Create a temporary file path in the temp directory
    const tempFilePath = `${tempDir}/${file.name}`;

    try {
      // Read the file's data as an ArrayBuffer
      const fileData = await file.arrayBuffer();
      fs.writeFileSync(tempFilePath, new Uint8Array(Buffer.from(fileData)));

      try {
        // Extract text from the file
        const extractedText = await extractTextFromFile(tempFilePath);
        console.log("Extracted text from file", extractedText);

        if (extractedText instanceof Error) {
          console.error("Error extracting text:", extractedText);
          return NextResponse.json(
            { message: "Failed to extract text from file" },
            { status: 500 }
          );
        }

        // Return extracted text as JSON response
        return NextResponse.json({ text: extractedText }, { status: 200 });
      } catch (error) {
        console.error("Error processing file:", error);
        return NextResponse.json(
          { message: "Failed to process file" },
          { status: 500 }
        );
      } finally {
        // Clean up the temporary file
        fs.unlinkSync(tempFilePath);
      }
    } catch (error) {
      console.error("Error writing temporary file:", error);
      return NextResponse.json(
        { message: "Failed to process file" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error handling request:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// Function to extract text from the uploaded file
async function extractTextFromFile(path: string) {
  try {
    const data = await parseOfficeAsync(path);
    return data.toString();
  } catch (error) {
    return error;
  }
}
