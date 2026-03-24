import { describe, expect, it } from "vitest";

import { createStudyPackFromText } from "./study-generator";

describe("createStudyPackFromText", () => {
  it("creates study pack data from source text", () => {
    const pack = createStudyPackFromText({
      text: "Thermodynamics studies heat, work, and energy transfer. The first law states that energy is conserved. Entropy increases for spontaneous processes.",
      examType: "jee",
      language: "english",
    });

    expect(pack.flashcards.length).toBeGreaterThan(0);
    expect(pack.mcqs.length).toBeGreaterThan(0);
    expect(pack.summary.length).toBeGreaterThan(20);
  });
});
