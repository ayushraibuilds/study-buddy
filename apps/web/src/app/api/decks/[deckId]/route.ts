import { NextResponse } from "next/server";

import { getDeck, getRequestUserId } from "@/lib/deck-store";

export async function GET(
  request: Request,
  context: { params: Promise<{ deckId: string }> },
) {
  const { deckId } = await context.params;
  const deck = getDeck(getRequestUserId(request), deckId);

  if (!deck) {
    return NextResponse.json({ error: "Deck not found." }, { status: 404 });
  }

  return NextResponse.json({ deck });
}
