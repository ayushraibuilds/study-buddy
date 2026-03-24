import type {
  ExamType,
  Flashcard,
  Mcq,
  OutputLanguage,
  StudyPack,
} from "@study-buddy/contracts";
import { studyPackSchema } from "@study-buddy/contracts";

const stopWords = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "into",
  "your",
  "their",
  "have",
  "will",
  "were",
  "been",
  "about",
  "after",
  "before",
  "when",
  "what",
  "where",
  "which",
  "notes",
  "chapter",
  "because",
  "there",
  "these",
  "those",
  "while",
  "through",
]);

const copy = {
  english: {
    explain: "Explain this concept:",
    correct: "Correct answer:",
    summaryLead: "Revision snapshot:",
    commonTrap: "Common trap",
  },
  hindi: {
    explain: "इस अवधारणा को समझाइए:",
    correct: "सही उत्तर:",
    summaryLead: "त्वरित पुनरावृत्ति:",
    commonTrap: "आम गलती",
  },
} satisfies Record<OutputLanguage, Record<string, string>>;

export function createStudyPackFromText(input: {
  text: string;
  examType: ExamType;
  language: OutputLanguage;
}): StudyPack {
  const normalizedText = normalizeText(input.text);
  const sentences = splitSentences(normalizedText);
  const formulas = extractFormulas(normalizedText);
  const topics = extractTopics(normalizedText);
  const statements = sentences.length > 0 ? sentences : [normalizedText];

  const flashcards = statements.slice(0, 10).map((statement, index) => {
    const topic = topics[index % Math.max(topics.length, 1)] ?? input.examType.toUpperCase();

    return {
      front: `${copy[input.language].explain} ${topic}`,
      back: statement,
      tags: [topic.toLowerCase(), input.examType],
    } satisfies Flashcard;
  });

  const mcqs = flashcards.slice(0, 5).map((card, index) =>
    createMcq(card, flashcards, index, input.language),
  );

  const summaryParts = [
    `${copy[input.language].summaryLead} ${statements.slice(0, 2).join(" ")}`,
    `This ${input.examType.toUpperCase()}-oriented pack emphasizes ${topics
      .slice(0, 3)
      .join(", ") || "core concepts"} and turns them into short retrieval prompts.`,
  ];

  const weakTopics = topics.slice(0, 3).map((topic, index) =>
    index === 0 ? `${topic} (${copy[input.language].commonTrap})` : topic,
  );

  return studyPackSchema.parse({
    flashcards,
    mcqs,
    summary: summaryParts.join(" "),
    keyFormulas: formulas.slice(0, 6),
    weakTopics: weakTopics.length > 0 ? weakTopics : [input.examType.toUpperCase()],
  });
}

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 40)
    .slice(0, 12);
}

function extractTopics(text: string) {
  const frequencies = new Map<string, number>();

  text
    .toLowerCase()
    .match(/[a-z][a-z-]{3,}/g)
    ?.forEach((word) => {
      if (stopWords.has(word)) {
        return;
      }

      frequencies.set(word, (frequencies.get(word) ?? 0) + 1);
    });

  return [...frequencies.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 8)
    .map(([word]) => word);
}

function extractFormulas(text: string) {
  return [...new Set(text.match(/[A-Za-z0-9_()^+\-/*]+ ?= ?[A-Za-z0-9_()^+\-/* ]+/g) ?? [])];
}

function createMcq(
  card: Flashcard,
  allCards: Flashcard[],
  index: number,
  language: OutputLanguage,
): Mcq {
  const distractors = allCards
    .filter((candidate) => candidate.back !== card.back)
    .slice(index, index + 3)
    .map((candidate) => candidate.back);

  while (distractors.length < 3) {
    distractors.push(`A broader but less precise explanation of ${card.tags[0] ?? "the topic"}.`);
  }

  const options = shuffle([card.back, ...distractors]).map((option) => clamp(option, 118));

  return {
    question:
      language === "hindi"
        ? `${card.tags[0]} के लिए सबसे सटीक कथन कौन-सा है?`
        : `Which statement best matches ${card.tags[0]}?`,
    options,
    correct: clamp(card.back, 118),
    explanation:
      language === "hindi"
        ? `${copy.hindi.correct} ${clamp(card.back, 180)}`
        : `${copy.english.correct} ${clamp(card.back, 180)}`,
  };
}

function clamp(text: string, max: number) {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}
