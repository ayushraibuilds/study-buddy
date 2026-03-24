import { NextResponse } from "next/server";
import { exportAnkiPayloadSchema } from "@study-buddy/contracts";

import { createAnkiPackage } from "@/lib/study-engine-export";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = exportAnkiPayloadSchema.parse(await request.json());
    const apkgBuffer = await createAnkiPackage(payload);

    return new NextResponse(apkgBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${payload.title.replace(/\s+/g, "-").toLowerCase()}.apkg"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to export Anki package.",
      },
      { status: 500 },
    );
  }
}
