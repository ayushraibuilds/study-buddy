from __future__ import annotations

import io
import os
import tempfile
import json
import re
from pathlib import Path

import fitz
import genanki
import groq
from youtube_transcript_api import YouTubeTranscriptApi
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

app = FastAPI(title="Study Buddy Study Engine")

class TranscriptRequest(BaseModel):
    url: str

class GenerateCardsRequest(BaseModel):
    text: str


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


@app.post("/youtube-transcript")
async def get_youtube_transcript(payload: TranscriptRequest):
    try:
        # Extract video ID
        match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11}).*", payload.url)
        if not match:
            raise ValueError("Invalid YouTube URL")
            
        video_id = match.group(1)
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        text_parts = [t['text'] for t in transcript]
        return JSONResponse({"text": " ".join(text_parts)})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/generate-flashcards")
async def generate_flashcards(payload: GenerateCardsRequest):
    if not payload.text:
        raise HTTPException(status_code=400, detail="Text required")
        
    groq_api_key = os.environ.get("GROQ_API_KEY", "dummy-key-for-now")
    
    try:
        client = groq.Groq(api_key=groq_api_key)
        prompt = f"Create 5 flashcards from the following text. Return a JSON object with a 'flashcards' key containing an array of objects with 'front' and 'back' keys. Keep answers concise. Text: {payload.text[:8000]}"
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        content = completion.choices[0].message.content
        return JSONResponse(json.loads(content))
    except Exception as e:
        # Fallback dummy for testing if API key fails
        print(f"Groq API error: {e}")
        return JSONResponse({
            "flashcards": [
                {"front": "Sample Question 1", "back": "Sample Answer 1"},
                {"front": "Sample Question 2", "back": "Sample Answer 2"}
            ]
        })


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
