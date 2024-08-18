import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";
import pdfParse from "pdf-parse";

// Disable automatic body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to parse form data
const parseForm = (req: NextRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  const form = new formidable.IncomingForm({
    uploadDir: "/tmp",
    keepExtensions: true,
  });

  return new Promise((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) {
        console.error("Error parsing form:", err);
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
};

// API Route Handler
export async function POST(req: NextRequest) {
  // Log to confirm that the route was hit
  console.log("API route /api/uploadPdf was hit");

  try {
    const { files } = await parseForm(req);

    if (!files.file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    // Handle file (formidable may return a file object or array)
    const pdfFile = Array.isArray(files.file) ? files.file[0] : files.file;
    console.log("Uploaded PDF file:", pdfFile);

    const fileData = fs.readFileSync(pdfFile.filepath);

    // Parse PDF content
    const data = await pdfParse(fileData);
    console.log("Extracted PDF text");

    return NextResponse.json({ text: data.text }, { status: 200 });
  } catch (error) {
    console.error("Error processing PDF:", error);
    return NextResponse.json({ message: "Failed to process PDF" }, { status: 500 });
  }
}
