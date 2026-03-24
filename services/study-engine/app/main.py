from __future__ import annotations

import io
import os
import tempfile
from pathlib import Path

import fitz
import genanki
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

app = FastAPI(title="Study Buddy Study Engine")


class FlashcardModel(BaseModel):
    front: str
    back: str
    tags: list[str] = []


class ExportRequest(BaseModel):
    title: str
    examType: str
    language: str
    flashcards: list[FlashcardModel]


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_bytes = await file.read()

    try:
        document = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception as error:  # pragma: no cover - defensive
        raise HTTPException(status_code=400, detail="Could not open the PDF.") from error

    text_parts: list[str] = []

    for page in document:
        text_parts.append(page.get_text("text"))

    return JSONResponse({"text": " ".join(text_parts).strip()})


@app.post("/export-apkg")
def export_apkg(payload: ExportRequest):
    model_id = 1701010110
    deck_id = 2201010110

    model = genanki.Model(
        model_id,
        "Study Buddy Basic",
        fields=[
            {"name": "Question"},
            {"name": "Answer"},
        ],
        templates=[
            {
                "name": "Card 1",
                "qfmt": "{{Question}}",
                "afmt": "{{FrontSide}}<hr id=answer>{{Answer}}",
            }
        ],
    )

    deck = genanki.Deck(deck_id, payload.title)

    for card in payload.flashcards:
        note = genanki.Note(
            model=model,
            fields=[card.front, card.back],
            tags=[payload.examType, payload.language, *card.tags],
        )
        deck.add_note(note)

    with tempfile.TemporaryDirectory() as temp_dir:
        output_path = Path(temp_dir) / f"{payload.title}.apkg"
        package = genanki.Package(deck)
        package.write_to_file(str(output_path))

        file_bytes = output_path.read_bytes()

    return StreamingResponse(
        io.BytesIO(file_bytes),
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="{payload.title}.apkg"'
        },
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=os.getenv("HOST", "127.0.0.1"),
        port=int(os.getenv("PORT", "8000")),
        reload=True,
    )
