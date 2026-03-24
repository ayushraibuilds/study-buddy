import { describe, expect, it } from "vitest";

import { generateStudyPackResponseSchema } from "./index";

describe("contracts", () => {
  it("accepts a valid generation response", () => {
    const result = generateStudyPackResponseSchema.parse({
      deckId: "deck_123",
      title: "Thermodynamics",
      sourceMeta: {
        sourceType: "notes",
        title: "Thermodynamics",
        characterCount: 512,
      },
      studyPack: {
        flashcards: [
          {
            front: "What is energy?",
            back: "Capacity to do work.",
            tags: ["basics"],
          },
        ],
        mcqs: [
          {
            question: "Which law conserves energy?",
            options: ["Zeroth", "First", "Second", "Third"],
            correct: "First",
            explanation: "The first law is the energy conservation law.",
          },
        ],
        summary: "Energy changes form but is conserved.",
        keyFormulas: ["dU = dQ - dW"],
        weakTopics: ["sign convention"],
      },
    });

    expect(result.title).toBe("Thermodynamics");
  });
});
