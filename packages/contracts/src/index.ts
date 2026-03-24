import { z } from "zod";

export const examTypeValues = [
  "jee",
  "neet",
  "upsc",
  "ca",
  "gate",
  "ssc",
] as const;

export const outputLanguageValues = ["english", "hindi"] as const;

export const sourceTypeValues = ["pdf", "notes"] as const;

export const examTypeSchema = z.enum(examTypeValues);
export const outputLanguageSchema = z.enum(outputLanguageValues);
export const sourceTypeSchema = z.enum(sourceTypeValues);

export type ExamType = z.infer<typeof examTypeSchema>;
export type OutputLanguage = z.infer<typeof outputLanguageSchema>;
export type SourceType = z.infer<typeof sourceTypeSchema>;

export const flashcardSchema = z.object({
  front: z.string().min(1),
  back: z.string().min(1),
  tags: z.array(z.string().min(1)).default([]),
});

export const mcqSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  correct: z.string().min(1),
  explanation: z.string().min(1),
});

export const studyPackSchema = z.object({
  flashcards: z.array(flashcardSchema).min(1),
  mcqs: z.array(mcqSchema).min(1),
  summary: z.string().min(1),
  keyFormulas: z.array(z.string().min(1)),
  weakTopics: z.array(z.string().min(1)),
});

export type Flashcard = z.infer<typeof flashcardSchema>;
export type Mcq = z.infer<typeof mcqSchema>;
export type StudyPack = z.infer<typeof studyPackSchema>;

export const sourceMetaSchema = z.object({
  sourceType: sourceTypeSchema,
  title: z.string().min(1),
  fileName: z.string().optional(),
  characterCount: z.number().int().nonnegative(),
});

export type SourceMeta = z.infer<typeof sourceMetaSchema>;

export const generationPayloadSchema = z.object({
  examType: examTypeSchema,
  language: outputLanguageSchema,
  sourceType: sourceTypeSchema,
  notes: z.string().optional(),
});

export type GenerationPayload = z.infer<typeof generationPayloadSchema>;

export const generateStudyPackResponseSchema = z.object({
  deckId: z.string().optional(),
  title: z.string().min(1),
  sourceMeta: sourceMetaSchema,
  studyPack: studyPackSchema,
});

export type GenerateStudyPackResponse = z.infer<
  typeof generateStudyPackResponseSchema
>;

export const deckSummarySchema = z.object({
  deckId: z.string().min(1),
  title: z.string().min(1),
  examType: examTypeSchema,
  language: outputLanguageSchema,
  createdAt: z.string().min(1),
  counts: z.object({
    flashcards: z.number().int().nonnegative(),
    mcqs: z.number().int().nonnegative(),
    formulas: z.number().int().nonnegative(),
  }),
});

export type DeckSummary = z.infer<typeof deckSummarySchema>;

export const deckRecordSchema = z.object({
  deckId: z.string().min(1),
  title: z.string().min(1),
  examType: examTypeSchema,
  language: outputLanguageSchema,
  createdAt: z.string().min(1),
  sourceMeta: sourceMetaSchema,
  studyPack: studyPackSchema,
});

export type DeckRecord = z.infer<typeof deckRecordSchema>;

export const exportAnkiPayloadSchema = z.object({
  title: z.string().min(1),
  examType: examTypeSchema,
  language: outputLanguageSchema,
  flashcards: z.array(flashcardSchema).min(1),
});

export type ExportAnkiPayload = z.infer<typeof exportAnkiPayloadSchema>;
