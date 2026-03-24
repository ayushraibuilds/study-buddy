import { Buffer } from "node:buffer";

import type { SourceType } from "@study-buddy/contracts";

const STUDY_ENGINE_URL = process.env.STUDY_ENGINE_URL;

export async function extractSourceText(input: {
  sourceType: SourceType;
  notes?: string;
  file?: File;
}) {
  if (input.sourceType === "notes") {
    return input.notes?.trim() ?? "";
  }

  if (!input.file) {
    throw new Error("A PDF file is required.");
  }

  if (STUDY_ENGINE_URL) {
    return extractViaSidecar(input.file);
  }

  const pdfParse = (await import("pdf-parse")).default;
  const buffer = Buffer.from(await input.file.arrayBuffer());
  const parsed = await pdfParse(buffer);
  return parsed.text?.replace(/\s+/g, " ").trim() ?? "";
}

async function extractViaSidecar(file: File) {
  const formData = new FormData();
  formData.set("file", file, file.name);

  const response = await fetch(`${STUDY_ENGINE_URL}/extract-text`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Study engine could not extract the PDF.");
  }

  const payload = (await response.json()) as { text: string };
  return payload.text.trim();
}
