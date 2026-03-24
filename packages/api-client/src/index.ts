import {
  deckRecordSchema,
  deckSummarySchema,
  exportAnkiPayloadSchema,
  generateStudyPackResponseSchema,
  type DeckRecord,
  type DeckSummary,
  type ExamType,
  type ExportAnkiPayload,
  type GenerateStudyPackResponse,
  type OutputLanguage,
  type SourceType,
} from "@study-buddy/contracts";

export type GenerateStudyPackInput = {
  examType: ExamType;
  language: OutputLanguage;
  sourceType: SourceType;
  notes?: string;
  file?: Blob;
  fileName?: string;
};

type ClientOptions = {
  baseUrl: string;
  userId?: string;
  fetchFn?: typeof fetch;
};

export class StudyBuddyApiClient {
  private readonly baseUrl: string;
  private readonly userId?: string;
  private readonly fetchFn: typeof fetch;

  constructor({ baseUrl, userId, fetchFn }: ClientOptions) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.userId = userId;
    this.fetchFn = fetchFn ?? fetch;
  }

  async generateStudyPack(
    input: GenerateStudyPackInput,
  ): Promise<GenerateStudyPackResponse> {
    const formData = new FormData();
    formData.set("examType", input.examType);
    formData.set("language", input.language);
    formData.set("sourceType", input.sourceType);

    if (input.notes) {
      formData.set("notes", input.notes);
    }

    if (input.file) {
      formData.set("file", input.file, input.fileName ?? "study-source.pdf");
    }

    const response = await this.fetchFn(`${this.baseUrl}/api/generate`, {
      method: "POST",
      headers: this.buildHeaders(),
      body: formData,
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error ?? "Failed to generate study pack.");
    }

    return generateStudyPackResponseSchema.parse(payload);
  }

  async listDecks(): Promise<DeckSummary[]> {
    const response = await this.fetchFn(`${this.baseUrl}/api/decks`, {
      headers: this.buildHeaders(),
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error ?? "Failed to list decks.");
    }

    return deckSummarySchema.array().parse(payload.decks);
  }

  async getDeck(deckId: string): Promise<DeckRecord> {
    const response = await this.fetchFn(`${this.baseUrl}/api/decks/${deckId}`, {
      headers: this.buildHeaders(),
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error ?? "Failed to load deck.");
    }

    return deckRecordSchema.parse(payload.deck);
  }

  async exportAnki(payload: ExportAnkiPayload): Promise<Blob> {
    const body = exportAnkiPayloadSchema.parse(payload);
    const response = await this.fetchFn(`${this.baseUrl}/api/export/anki`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.buildHeaders(),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorPayload = await response
        .json()
        .catch(() => ({ error: "Failed to export Anki deck." }));

      throw new Error(errorPayload.error ?? "Failed to export Anki deck.");
    }

    return response.blob();
  }

  private buildHeaders() {
    const headers: Record<string, string> = {};

    if (this.userId) {
      headers["x-study-buddy-user"] = this.userId;
    }

    return headers;
  }
}
