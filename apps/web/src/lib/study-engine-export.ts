import { Buffer } from "node:buffer";

import type { ExportAnkiPayload } from "@study-buddy/contracts";

const STUDY_ENGINE_URL = process.env.STUDY_ENGINE_URL;

export async function createAnkiPackage(payload: ExportAnkiPayload) {
  if (!STUDY_ENGINE_URL) {
    throw new Error(
      "Real Anki export requires the study-engine sidecar. Set STUDY_ENGINE_URL to enable it.",
    );
  }

  const response = await fetch(`${STUDY_ENGINE_URL}/export-apkg`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Study engine could not export the Anki package.");
  }

  return Buffer.from(await response.arrayBuffer());
}
