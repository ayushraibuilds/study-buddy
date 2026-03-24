import { NextResponse } from "next/server";
import { generateStudyPackResponseSchema } from "@study-buddy/contracts";
import { sourceTypeSchema } from "@study-buddy/contracts";
import { examTypeSchema, outputLanguageSchema } from "@study-buddy/contracts";

import { getRequestUserId, saveDeck } from "@/lib/deck-store";
import { extractSourceText } from "@/lib/study-engine-client";
import { createStudyPackFromText } from "@/lib/study-generator";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const examType = examTypeSchema.parse(formData.get("examType"));
    const language = outputLanguageSchema.parse(formData.get("language"));
    const sourceType = sourceTypeSchema.parse(formData.get("sourceType"));
    const notes = formData.get("notes");
    const file = formData.get("file");

    if (sourceType === "notes" && typeof notes !== "string") {
      return NextResponse.json({ error: "Notes are required for note-based generation." }, { status: 400 });
    }

    if (sourceType === "pdf" && !(file instanceof File)) {
      return NextResponse.json({ error: "A PDF file is required." }, { status: 400 });
    }

    if (file instanceof File && file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "PDFs must be smaller than 10MB." }, { status: 400 });
    }

    const sourceText = await extractSourceText({
      sourceType,
      notes: typeof notes === "string" ? notes : undefined,
      file: file instanceof File ? file : undefined,
    });

    if (!sourceText || sourceText.trim().length < 60) {
      return NextResponse.json(
        {
          error:
            "We could not extract enough source text. Try a richer notes block or another digital PDF.",
        },
        { status: 400 },
      );
    }

    const title =
      sourceType === "pdf" && file instanceof File
        ? file.name.replace(/\.pdf$/i, "")
        : sourceText.split(/[.!?]/)[0]?.slice(0, 70) ?? "Study Pack";

    const studyPack = createStudyPackFromText({
      text: sourceText,
      examType,
      language,
    });

    const savedDeck = saveDeck(getRequestUserId(request), {
      title,
      examType,
      language,
      sourceMeta: {
        sourceType,
        title,
        fileName: file instanceof File ? file.name : undefined,
        characterCount: sourceText.length,
      },
      studyPack,
    });

    return NextResponse.json(
      generateStudyPackResponseSchema.parse({
        deckId: savedDeck.deckId,
        title: savedDeck.title,
        sourceMeta: savedDeck.sourceMeta,
        studyPack: savedDeck.studyPack,
      }),
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate study pack.",
      },
      { status: 500 },
    );
  }
}
