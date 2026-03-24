# Project: Study Buddy
**Goal:** A Next.js web app that converts textbook PDFs, notes, or YouTube URLs into Anki flashcards, MCQs, and concept summaries in under 30 seconds. Targeted at Indian competitive exams (JEE, NEET, UPSC, CA).

## Tech Stack
* **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, TypeScript.
* **Backend:** Next.js Route Handlers (or separate Python FastAPI microservice for heavy PDF/Anki tasks).
* **Database & Auth:** Supabase (PostgreSQL, Google OAuth, Storage for PDFs).
* **Core Libraries:** `react-dropzone` (uploads), `PyMuPDF` / `fitz` (text extraction), `genanki` (Anki .apkg generation).
* **AI Provider:** Claude / Groq (for fast JSON generation).

## Design System & UI
* **Aesthetic:** Clean, mobile-first, study-focused. 
* **Colors:** Primary Purple (`#534AB7`), Light Purple Bg (`#EEEDFE`), Text Primary (`#111827`), Text Secondary (`#6B7280`), Success Green (`#1D9E75`), Error Red (`#E24B4A`).
* **Components:** Rounded cards (`rounded-2xl`), subtle borders (`border-gray-200`), dense information architecture suitable for students.

## Core Data Models (Supabase)
1.  **Users:** Handled by Supabase Auth.
2.  **Decks:** `id`, `user_id`, `title`, `exam_type`, `language`, `source_type` (pdf/text/url), `created_at`.
3.  **Cards:** `id`, `deck_id`, `front`, `back`, `tags`.
4.  **MCQs:** `id`, `deck_id`, `question`, `options` (JSON), `correct_answer`, `explanation`.

## The AI Output JSON Schema
The AI generation step MUST strictly return this JSON format:
{
  "flashcards": [{"front": "string", "back": "string", "tags": ["string"]}],
  "mcqs": [{"question": "string", "options": ["string", "string", "string", "string"], "correct": "string", "explanation": "string"}],
  "summary": "string",
  "key_formulas": ["string"],
  "weak_topics": ["string"]
}

## Development Rules for LLMs
1.  **No boilerplate:** Output only the code that needs to be changed.
2.  **TypeScript strictly:** Use interfaces for all data models.
3.  **Tailwind only:** Do not write custom CSS unless absolutely necessary. Use Tailwind utility classes.
4.  **Mobile-first:** Always ensure the UI works on a 360px wide screen first.
