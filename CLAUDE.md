
# Project: Study Buddy
**Goal:** A web application that converts textbook PDFs, raw notes, or YouTube URLs into Anki flashcards, MCQs, and concept summaries in under 30 seconds. Targeted at Indian competitive exams (JEE, NEET, UPSC, CA).

## Tech Stack
* **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, TypeScript.
* **Backend:** Next.js Route Handlers (and Python serverless/microservices for heavy AI/PDF tasks).
* **Database & Auth:** Supabase (PostgreSQL, Google OAuth, Storage for PDFs).
* **Core Libraries:** `react-dropzone` (uploads), `PyMuPDF`/`fitz` (text extraction), `genanki` (Anki .apkg generation).

## Design System & UI Tokens
* **Aesthetic:** Clean, mobile-first, study-focused.
* **Colors:** * Primary Purple: `#534AB7`
  * Light Purple Bg: `#EEEDFE`
  * Text Primary: `#111827`
  * Text Secondary: `#6B7280`
  * Success Green: `#1D9E75` (Bg: `#EAF3DE`)
  * Error Red: `#E24B4A` (Bg: `#FCEBEB`)
* **Components:** Rounded corners (`rounded-2xl`), subtle borders (`border-gray-200`), dense information architecture.

## Core Database Schema (Supabase)
* **Users:** Managed via Supabase Auth.
* **Decks:** `id`, `user_id`, `title`, `exam_type`, `language`, `source_type`, `created_at`.
* **Flashcards:** `id`, `deck_id`, `front`, `back`, `tags`.
* **MCQs:** `id`, `deck_id`, `question`, `options` (JSON), `correct_answer`, `explanation`.

## The AI Output JSON Schema (Strict Constraint)
All generative prompts must enforce this exact JSON structure:
{
  "flashcards": [{"front": "string", "back": "string", "tags": ["string"]}],
  "mcqs": [{"question": "string", "options": ["string", "string", "string", "string"], "correct": "string", "explanation": "string"}],
  "summary": "string",
  "key_formulas": ["string"],
  "weak_topics": ["string"]
}

## Development Rules
1. **No boilerplate:** Output only the code that needs to be changed or created.
2. **TypeScript strictly:** Use explicit interfaces/types for all data models. No `any`.
3. **Tailwind only:** Do not write custom CSS unless targeting complex animations Tailwind cannot handle.
4. **Mobile-first:** Ensure all UI components are responsive, starting from a 360px width.