"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { StudyBuddyApiClient } from "@study-buddy/api-client";
import type {
  ExamType,
  ExportAnkiPayload,
  GenerateStudyPackResponse,
  OutputLanguage,
  SourceType,
} from "@study-buddy/contracts";
import {
  BookOpen,
  BrainCircuit,
  FileText,
  Languages,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";

const apiClient = new StudyBuddyApiClient({
  baseUrl: "",
  userId: "web-anonymous",
});

const examOptions: Array<{ value: ExamType; label: string }> = [
  { value: "jee", label: "JEE" },
  { value: "neet", label: "NEET" },
  { value: "upsc", label: "UPSC" },
  { value: "ca", label: "CA" },
  { value: "gate", label: "GATE" },
  { value: "ssc", label: "SSC" },
];

const languageOptions: Array<{ value: OutputLanguage; label: string }> = [
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
];

const processingSteps = [
  "Reading your source material",
  "Selecting exam-style question angles",
  "Building flashcards, MCQs, and a quick revision map",
  "Packaging the deck for export",
];

type Tab = "flashcards" | "mcqs" | "summary";

export function StudyBuddyExperience() {
  const [sourceType, setSourceType] = useState<SourceType>("notes");
  const [examType, setExamType] = useState<ExamType>("jee");
  const [language, setLanguage] = useState<OutputLanguage>("english");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<GenerateStudyPackResponse | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("flashcards");
  const [revealedCards, setRevealedCards] = useState<Record<number, boolean>>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!isGenerating) {
      return;
    }

    const interval = window.setInterval(() => {
      setStepIndex((current) => (current < processingSteps.length - 1 ? current + 1 : current));
    }, 1100);

    return () => window.clearInterval(interval);
  }, [isGenerating]);

  const stats = useMemo(() => {
    if (!result) {
      return [];
    }

    return [
      { label: "Flashcards", value: result.studyPack.flashcards.length },
      { label: "MCQs", value: result.studyPack.mcqs.length },
      { label: "Formulas", value: result.studyPack.keyFormulas.length },
      { label: "Weak topics", value: result.studyPack.weakTopics.length },
    ];
  }, [result]);

  const onDrop = (acceptedFiles: File[]) => {
    const firstFile = acceptedFiles[0];
    if (!firstFile) {
      return;
    }

    setError(null);
    setSourceType("pdf");
    setFile(firstFile);
  };

  const dropzone = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDropAccepted: onDrop,
    onDropRejected: () => {
      setError("Please upload a PDF under 10MB.");
    },
  });

  const handleGenerate = async () => {
    setError(null);
    setStepIndex(0);

    if (sourceType === "notes" && notes.trim().length < 80) {
      setError("Paste a little more context so the study pack has something real to work with.");
      return;
    }

    if (sourceType === "pdf" && !file) {
      setError("Choose a PDF before generating.");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await apiClient.generateStudyPack({
        examType,
        language,
        sourceType,
        notes: sourceType === "notes" ? notes : undefined,
        file: sourceType === "pdf" ? file ?? undefined : undefined,
        fileName: file?.name,
      });

      setResult(response);
      setActiveTab("flashcards");
      setRevealedCards({});
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong while generating your pack.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    if (!result) {
      return;
    }

    setIsExporting(true);

    try {
      const blob = await apiClient.exportAnki({
        title: result.title,
        examType,
        language,
        flashcards: result.studyPack.flashcards,
      } satisfies ExportAnkiPayload);

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${result.title.replace(/\s+/g, "-").toLowerCase()}.apkg`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (exportError) {
      setError(
        exportError instanceof Error ? exportError.message : "Export failed. Please try again.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="study-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[32px] border border-white/70 bg-[var(--sb-gradient-hero)] p-6 shadow-[var(--sb-shadow-halo)] sm:p-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--sb-violet-soft)] px-3 py-1 text-xs font-bold tracking-[0.18em] text-[var(--sb-violet)] uppercase">
                <Sparkles className="size-3.5" />
                Study Buddy
              </p>
              <h1
                className="max-w-xl text-4xl leading-[1.05] font-semibold tracking-tight text-[var(--sb-slate)] sm:text-5xl"
                style={{ fontFamily: "var(--font-study-display)" }}
              >
                Turn raw study material into a revision system in one sitting.
              </h1>
            </div>
          </div>

          <p className="max-w-2xl text-base leading-7 text-[var(--sb-subtext)] sm:text-lg">
            Built for students preparing for JEE, NEET, UPSC, CA, GATE, and SSC. Drop in a PDF
            or paste your notes, then get a retrieval-first study pack with flashcards, MCQs, a
            fast summary, and Anki export.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <FeatureChip icon={BookOpen} label="Retrieval first" value="Flashcards + MCQs" />
            <FeatureChip icon={Languages} label="Bilingual output" value="English or Hindi" />
            <FeatureChip icon={BrainCircuit} label="Exam aware" value="JEE to UPSC" />
          </div>

          <div className="mt-8 rounded-[28px] border border-[var(--sb-line)] bg-white/70 p-4 shadow-[var(--sb-shadow-card)] backdrop-blur sm:p-5">
            <div className="mb-4 flex rounded-full bg-[var(--sb-shell)] p-1">
              {(["notes", "pdf"] as const).map((value) => (
                <button
                  key={value}
                  className={cn(
                    "flex-1 rounded-full px-4 py-2 text-sm font-semibold transition",
                    sourceType === value
                      ? "bg-[var(--sb-violet)] text-white shadow-lg"
                      : "text-[var(--sb-subtext)]",
                  )}
                onClick={() => {
                  setSourceType(value);
                  setError(null);
                  if (value === "notes") {
                    setFile(null);
                  }
                }}
                type="button"
              >
                  {value === "notes" ? "Paste notes" : "Upload PDF"}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[var(--sb-subtext)] uppercase">
                  Target exam
                </p>
                <div className="flex flex-wrap gap-2">
                  {examOptions.map((option) => (
                    <ChipButton
                      key={option.value}
                      active={examType === option.value}
                      label={option.label}
                      onClick={() => setExamType(option.value)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[var(--sb-subtext)] uppercase">
                  Output language
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {languageOptions.map((option) => (
                    <ChipButton
                      key={option.value}
                      active={language === option.value}
                      label={option.label}
                      onClick={() => setLanguage(option.value)}
                      compact
                    />
                  ))}
                </div>
              </div>

              {sourceType === "notes" ? (
                <label className="block">
                  <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[var(--sb-subtext)] uppercase">
                    Your notes
                  </p>
                  <textarea
                    className="min-h-52 w-full rounded-[24px] border border-[var(--sb-line)] bg-[var(--sb-paper)] px-4 py-4 text-sm leading-6 text-[var(--sb-slate)] outline-none transition focus:border-[var(--sb-violet)]"
                    placeholder="Paste your chapter notes, textbook extract, or revision points here..."
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                  />
                  <div className="mt-2 text-xs text-[var(--sb-subtext)]">
                    Richer notes create better cards. Aim for at least a few paragraphs.
                  </div>
                </label>
              ) : (
                <div
                  {...dropzone.getRootProps()}
                  className={cn(
                    "rounded-[24px] border border-dashed border-[var(--sb-violet)] bg-[var(--sb-violet-soft)]/60 px-5 py-8 text-center transition",
                    dropzone.isDragActive && "scale-[0.99] bg-[var(--sb-violet-soft)]",
                  )}
                >
                  <input {...dropzone.getInputProps()} />
                  <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-white text-[var(--sb-violet)]">
                    <FileText className="size-5" />
                  </div>
                  <p className="text-base font-semibold text-[var(--sb-violet)]">
                    {file ? file.name : "Drop a chapter PDF here"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--sb-subtext)]">
                    Drag and drop or tap to browse. Digital PDFs work now; OCR comes later.
                  </p>
                </div>
              )}

              {error ? (
                <div className="rounded-[20px] border border-[var(--sb-coral)] bg-[var(--sb-coral)]/70 px-4 py-3 text-sm text-[var(--sb-coral-ink)]">
                  {error}
                </div>
              ) : null}

              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--sb-violet)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(83,74,183,0.35)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
                onClick={handleGenerate}
                type="button"
                disabled={isGenerating}
              >
                {isGenerating ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {isGenerating ? "Building your study pack..." : "Generate study pack"}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/70 bg-[var(--sb-gradient-card)] p-4 shadow-[var(--sb-shadow-card)] backdrop-blur sm:p-5">
          {isGenerating ? (
            <div className="flex min-h-[720px] flex-col justify-between rounded-[28px] border border-[var(--sb-line)] bg-white/75 p-5">
              <div>
                <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[var(--sb-subtext)] uppercase">
                  Processing
                </p>
                <h2
                  className="text-3xl font-semibold text-[var(--sb-slate)]"
                  style={{ fontFamily: "var(--font-study-display)" }}
                >
                  Building your revision workspace
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--sb-subtext)]">
                  We are shaping the source into recall-friendly prompts, distractor-aware MCQs,
                  and a tight summary.
                </p>
              </div>

              <div className="my-10 flex justify-center">
                <div className="flex size-28 items-center justify-center rounded-full border border-[var(--sb-line)] bg-[var(--sb-violet-soft)] text-[var(--sb-violet)] shadow-[var(--sb-shadow-card)]">
                  <LoaderCircle className="size-10 animate-spin" />
                </div>
              </div>

              <div className="space-y-3">
                {processingSteps.map((step, index) => {
                  const isActive = index === stepIndex;
                  const isDone = index < stepIndex;

                  return (
                    <div
                      key={step}
                      className={cn(
                        "rounded-[20px] border px-4 py-3 text-sm transition",
                        isActive
                          ? "border-[var(--sb-violet)] bg-[var(--sb-violet-soft)] text-[var(--sb-violet)]"
                          : isDone
                            ? "border-[var(--sb-mint)] bg-[var(--sb-mint)]/60 text-[var(--sb-slate)]"
                            : "border-[var(--sb-line)] bg-[var(--sb-paper)] text-[var(--sb-subtext)]",
                      )}
                    >
                      {step}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : result ? (
            <div className="min-h-[720px] rounded-[28px] border border-[var(--sb-line)] bg-white/85 p-5">
              <div className="mb-6">
                <div className="mb-2 text-xs font-bold tracking-[0.18em] text-[var(--sb-subtext)] uppercase">
                  Results
                </div>
                <h2
                  className="text-3xl font-semibold text-[var(--sb-slate)]"
                  style={{ fontFamily: "var(--font-study-display)" }}
                >
                  {result.title}
                </h2>
                <p className="mt-2 text-sm text-[var(--sb-subtext)]">
                  {examType.toUpperCase()} • {language === "english" ? "English" : "Hindi"} •{" "}
                  {result.sourceMeta.sourceType === "pdf" ? result.sourceMeta.fileName : "Pasted notes"}
                </p>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-2">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[22px] border border-[var(--sb-line)] bg-[var(--sb-paper)] px-4 py-4 text-center"
                  >
                    <div className="text-2xl font-semibold text-[var(--sb-violet)]">{stat.value}</div>
                    <div className="mt-1 text-xs font-semibold tracking-[0.08em] text-[var(--sb-subtext)] uppercase">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-5 flex rounded-full bg-[var(--sb-shell)] p-1">
                {(["flashcards", "mcqs", "summary"] as const).map((tab) => (
                  <button
                    key={tab}
                    className={cn(
                      "flex-1 rounded-full px-3 py-2 text-sm font-semibold transition",
                      activeTab === tab ? "bg-white text-[var(--sb-violet)] shadow-sm" : "text-[var(--sb-subtext)]",
                    )}
                    onClick={() => startTransition(() => setActiveTab(tab))}
                    type="button"
                  >
                    {tab === "flashcards" ? "Flashcards" : tab === "mcqs" ? "MCQ quiz" : "Summary"}
                  </button>
                ))}
              </div>

              {activeTab === "flashcards" ? (
                <div className="space-y-3">
                  {result.studyPack.flashcards.slice(0, 6).map((card, index) => {
                    const revealed = revealedCards[index];

                    return (
                      <div
                        key={`${card.front}-${index}`}
                        className="overflow-hidden rounded-[24px] border border-[var(--sb-line)] bg-[var(--sb-paper)]"
                      >
                        <div className="bg-[var(--sb-violet)] px-4 py-4 text-white">
                          <div className="text-sm font-semibold leading-6">{card.front}</div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {card.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {revealed ? (
                          <div className="px-4 py-4 text-sm leading-6 text-[var(--sb-slate)]">{card.back}</div>
                        ) : null}

                        <button
                          className="w-full px-4 pb-4 text-right text-xs font-semibold tracking-[0.12em] text-[var(--sb-violet)] uppercase"
                          onClick={() =>
                            setRevealedCards((current) => ({
                              ...current,
                              [index]: !current[index],
                            }))
                          }
                          type="button"
                        >
                          {revealed ? "Hide answer" : "Show answer"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {activeTab === "mcqs" ? (
                <div className="space-y-3">
                  {result.studyPack.mcqs.slice(0, 4).map((mcq, index) => (
                    <div
                      key={`${mcq.question}-${index}`}
                      className="rounded-[24px] border border-[var(--sb-line)] bg-[var(--sb-paper)] p-4"
                    >
                      <div className="mb-3 text-sm font-semibold leading-6 text-[var(--sb-slate)]">
                        {mcq.question}
                      </div>
                      <div className="space-y-2">
                        {mcq.options.map((option) => {
                          const isCorrect = option === mcq.correct;

                          return (
                            <div
                              key={option}
                              className={cn(
                                "rounded-[16px] border px-3 py-2 text-sm",
                                isCorrect
                                  ? "border-[var(--sb-mint)] bg-[var(--sb-mint)]/70 text-[var(--sb-slate)]"
                                  : "border-[var(--sb-line)] bg-white text-[var(--sb-subtext)]",
                              )}
                            >
                              {option}
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-3 rounded-[16px] bg-[var(--sb-violet-soft)] px-3 py-3 text-sm leading-6 text-[var(--sb-violet)]">
                        {mcq.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {activeTab === "summary" ? (
                <div className="space-y-3">
                  <Panel title="Revision summary">{result.studyPack.summary}</Panel>
                  <Panel title="Key formulas">
                    <div className="flex flex-wrap gap-2">
                      {result.studyPack.keyFormulas.map((formula) => (
                        <span
                          key={formula}
                          className="rounded-[16px] bg-[var(--sb-violet-soft)] px-3 py-2 text-xs font-semibold text-[var(--sb-violet)]"
                        >
                          {formula}
                        </span>
                      ))}
                    </div>
                  </Panel>
                  <Panel title="Weak topics to revisit">
                    <div className="flex flex-wrap gap-2">
                      {result.studyPack.weakTopics.map((topic) => (
                        <span
                          key={topic}
                          className="rounded-full bg-[var(--sb-saffron)] px-3 py-1.5 text-xs font-semibold text-[var(--sb-saffron-ink)]"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </Panel>
                </div>
              ) : null}

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <button
                  className="rounded-full bg-[var(--sb-violet)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-70"
                  onClick={handleExport}
                  type="button"
                  disabled={isExporting}
                >
                  {isExporting ? "Exporting..." : "Export to Anki"}
                </button>
                <button
                  className="rounded-full border border-[var(--sb-line)] bg-[var(--sb-paper)] px-4 py-3 text-sm font-semibold text-[var(--sb-slate)]"
                  onClick={() => setResult(null)}
                  type="button"
                >
                  Create another pack
                </button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[720px] flex-col justify-between rounded-[28px] border border-[var(--sb-line)] bg-white/70 p-5">
              <div>
                <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[var(--sb-subtext)] uppercase">
                  Preview
                </p>
                <h2
                  className="text-3xl font-semibold text-[var(--sb-slate)]"
                  style={{ fontFamily: "var(--font-study-display)" }}
                >
                  Results designed for fast recall
                </h2>
              </div>

              <div className="space-y-4">
                <PreviewCard
                  title="Flashcards"
                  description="Short front/back prompts with topic tags so students can drill the exact chapter pain points."
                />
                <PreviewCard
                  title="Exam-style MCQs"
                  description="Distractor-aware multiple choice questions that feel closer to actual paper patterns."
                />
                <PreviewCard
                  title="Revision summary"
                  description="A compact chapter snapshot with formulas and weak topics to revisit before a mock test."
                />
              </div>

              <div className="rounded-[24px] bg-[var(--sb-violet-soft)] p-4 text-sm leading-6 text-[var(--sb-violet)]">
                Start with a chapter PDF or a block of notes. The app stays anonymous on the web,
                so you can test the flow before turning on sync and accounts.
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function FeatureChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/70 bg-white/65 p-4 shadow-[var(--sb-shadow-card)]">
      <Icon className="mb-3 size-5 text-[var(--sb-violet)]" />
      <div className="text-xs font-bold tracking-[0.14em] text-[var(--sb-subtext)] uppercase">{label}</div>
      <div className="mt-1 text-sm font-semibold text-[var(--sb-slate)]">{value}</div>
    </div>
  );
}

function ChipButton({
  active,
  label,
  onClick,
  compact = false,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-semibold transition",
        compact && "w-full",
        active
          ? "border-[var(--sb-violet)] bg-[var(--sb-violet-soft)] text-[var(--sb-violet)]"
          : "border-[var(--sb-line)] bg-white text-[var(--sb-subtext)]",
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function PreviewCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[24px] border border-[var(--sb-line)] bg-[var(--sb-paper)] p-4">
      <div className="text-base font-semibold text-[var(--sb-slate)]">{title}</div>
      <div className="mt-2 text-sm leading-6 text-[var(--sb-subtext)]">{description}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[24px] border border-[var(--sb-line)] bg-[var(--sb-paper)] p-4">
      <div className="mb-2 text-xs font-bold tracking-[0.14em] text-[var(--sb-subtext)] uppercase">{title}</div>
      <div className="text-sm leading-6 text-[var(--sb-slate)]">{children}</div>
    </div>
  );
}
