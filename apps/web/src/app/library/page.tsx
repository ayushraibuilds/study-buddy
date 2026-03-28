'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StudyBuddyApiClient } from "@study-buddy/api-client";
import { BookOpen, Brain, LoaderCircle } from "lucide-react";
import type { DeckSummary } from "@study-buddy/contracts";

const apiClient = new StudyBuddyApiClient({
  baseUrl: "",
  userId: "web-anonymous",
});

export default function Library() {
    const [decks, setDecks] = useState<DeckSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        apiClient.listDecks()
            .then(setDecks)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-6 sm:p-10">
            <header className="mb-8 flex items-center justify-between max-w-6xl mx-auto">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-2xl tracking-tight">
                    <Brain className="w-8 h-8" /> StudyBuddy Library
                </div>
                <Link href="/" className="px-5 py-2.5 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-700 shadow-md hover:shadow-lg transition">
                    + Create New Deck
                </Link>
            </header>
            
            <main className="max-w-6xl mx-auto">
                {loading ? (
                    <div className="flex justify-center p-20"><LoaderCircle className="w-10 h-10 animate-spin text-indigo-500" /></div>
                ) : error ? (
                    <div className="text-red-500 p-5 bg-red-50 rounded-xl border border-red-100">{error}</div>
                ) : decks.length === 0 ? (
                    <div className="text-center p-20 text-slate-500 bg-white rounded-3xl border border-slate-200">
                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-slate-700 mb-2">No decks found</h2>
                        <p className="text-slate-500 mb-6">Create your first study pack using an uploaded PDF or paste your notes.</p>
                        <Link href="/" className="px-6 py-3 bg-slate-100 text-slate-700 rounded-full font-semibold hover:bg-slate-200 transition">
                            Go to Generator
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {decks.map(deck => (
                            <Link key={deck.deckId} href={`/study?deckId=${deck.deckId}`} className="group block bg-white border border-slate-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1 transition duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <div className="text-[10px] font-bold tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded-full uppercase">
                                        {deck.examType}
                                    </div>
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-2">{deck.title}</h3>
                                <div className="flex items-center justify-between mt-6 border-t border-slate-50 pt-4">
                                    <div className="text-xs font-semibold text-slate-400 capitalize">{deck.language}</div>
                                    <div className="text-xs font-semibold text-indigo-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        Study Now &rarr;
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
