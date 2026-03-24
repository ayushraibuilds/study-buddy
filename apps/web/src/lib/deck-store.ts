import crypto from "node:crypto";

import type { DeckRecord, DeckSummary } from "@study-buddy/contracts";

const DEFAULT_USER_ID = "web-anonymous";

type DeckStore = Map<string, Map<string, DeckRecord>>;

declare global {
  var __studyBuddyDeckStore: DeckStore | undefined;
}

const store = globalThis.__studyBuddyDeckStore ?? new Map<string, Map<string, DeckRecord>>();

if (!globalThis.__studyBuddyDeckStore) {
  globalThis.__studyBuddyDeckStore = store;
}

export function getRequestUserId(request: Request) {
  return request.headers.get("x-study-buddy-user")?.trim() || DEFAULT_USER_ID;
}

export function saveDeck(userId: string, deck: Omit<DeckRecord, "deckId" | "createdAt">) {
  const deckRecord: DeckRecord = {
    ...deck,
    deckId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const userDecks = store.get(userId) ?? new Map<string, DeckRecord>();
  userDecks.set(deckRecord.deckId, deckRecord);
  store.set(userId, userDecks);

  return deckRecord;
}

export function listDecks(userId: string): DeckSummary[] {
  const userDecks = [...(store.get(userId)?.values() ?? [])];

  return userDecks
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map((deck) => ({
      deckId: deck.deckId,
      title: deck.title,
      examType: deck.examType,
      language: deck.language,
      createdAt: deck.createdAt,
      counts: {
        flashcards: deck.studyPack.flashcards.length,
        mcqs: deck.studyPack.mcqs.length,
        formulas: deck.studyPack.keyFormulas.length,
      },
    }));
}

export function getDeck(userId: string, deckId: string) {
  return store.get(userId)?.get(deckId);
}
