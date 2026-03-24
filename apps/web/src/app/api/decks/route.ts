import { NextResponse } from "next/server";

import { getRequestUserId, listDecks } from "@/lib/deck-store";

export async function GET(request: Request) {
  return NextResponse.json({
    decks: listDecks(getRequestUserId(request)),
  });
}
