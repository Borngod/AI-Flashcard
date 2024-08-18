
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { parseOfficeAsync } from "officeparser";
import os from 'os';

// Disable automatic body parsing (needed for file uploads)
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  console.log("API route /api/upload was hit");

  try {
    const formData = await req.formData();

    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: "No file uploaded or invalid file type" }, { status: 400 });
    }

    // Create a temporary file path using the OS-specific temporary directory
    const tempFilePath = `${os.tmpdir()}/${file.name}`;

    try {
      // Write the file data to the temporary file
      const fileData = await file.arrayBuffer();
      fs.writeFileSync(tempFilePath, Buffer.from(fileData));

      try {
        const extractedText = await extractTextFromFile(tempFilePath);
        console.log("Extracted text from file",extractedText);

        if (extractedText instanceof Error) {
          console.error("Error extracting text:", extractedText);
          return NextResponse.json(
            { message: "Failed to extract text from file" },
            { status: 500 }
          );
        }

        return NextResponse.json({ text: extractedText }, { status: 200 });
      } catch (error) {
        console.error("Error processing file:", error);
        return NextResponse.json({ message: "Failed to process file" }, { status: 500 });
      } finally {
        // Clean up the temporary file
        fs.unlinkSync(tempFilePath);
      }
    } catch (error) {
      console.error("Error writing temporary file:", error);
      return NextResponse.json({ message: "Failed to process file" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error handling request:", error);
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 });
  }
}

async function extractTextFromFile(path) {
  try {
    const data = await parseOfficeAsync(path);
    return data.toString();
  } catch (error) {
    return error; 
  }
}