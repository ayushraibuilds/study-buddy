# Study Buddy

Study Buddy is a monorepo for a student-focused study companion:

- `apps/web`: Next 16 App Router web experience.
- `apps/android`: Expo + React Native Android client.
- `packages/contracts`: shared runtime schemas and domain types.
- `packages/design-tokens`: cross-platform design tokens.
- `packages/api-client`: typed API client used by web and Android.
- `services/study-engine`: optional Python sidecar for PDF extraction and `.apkg` generation.

## Workspace Commands

```bash
npm install
npm run dev:web
npm run dev:android
npm run lint
npm run typecheck
npm run test
```

## Current Behavior

- Web supports a polished anonymous flow for notes or PDF input.
- Android is scaffolded as a real Expo app with sign-in, generation, library, study, and export/share flows.
- Shared schemas keep the clients aligned with the Next route handlers.
- The backend works in mock mode out of the box and can later delegate PDF extraction and Anki packaging to the Python sidecar.

## Environment

Optional environment variables for the web app:

```bash
STUDY_ENGINE_URL=http://127.0.0.1:8000
STUDY_BUDDY_API_BASE_URL=http://localhost:3000
```

Optional environment variables for Android:

```bash
EXPO_PUBLIC_STUDY_BUDDY_API_BASE_URL=http://10.0.2.2:3000
```
