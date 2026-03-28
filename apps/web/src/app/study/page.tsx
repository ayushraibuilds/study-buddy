'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Check, RotateCcw, Brain, LoaderCircle, ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { StudyBuddyApiClient } from "@study-buddy/api-client";
import type { DeckRecord } from "@study-buddy/contracts";

const apiClient = new StudyBuddyApiClient({
  baseUrl: "",
  userId: "web-anonymous",
});

export default function StudySession() {
    const searchParams = useSearchParams();
    const deckId = searchParams.get('deckId');

    const [deck, setDeck] = useState<DeckRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);

    useEffect(() => {
        if (!deckId) {
            return;
        }

        apiClient.getDeck(deckId)
            .then(setDeck)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [deckId]);

    const cards = deck?.studyPack?.flashcards || [];

    const handleFlip = () => setIsFlipped(!isFlipped);

    const handleResponse = (_quality: 'again' | 'hard' | 'good' | 'easy') => {
        setIsFlipped(false);
        // Spaced repetition interval calculation would go here (SuperMemo-2 algorithm)
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setSessionComplete(true);
        }
    };

    if (sessionComplete) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Session Complete!</h2>
                    <p className="text-slate-600 mb-8">You reviewed {cards.length} cards today. Your memory retention is improving.</p>
                    <div className="flex gap-3 mt-6">
                        <button 
                            onClick={() => { setCurrentIndex(0); setSessionComplete(false); setIsFlipped(false); }}
                            className="flex-1 py-4 bg-slate-100 text-slate-800 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition"
                        >
                            <RotateCcw className="w-5 h-5" /> Restart
                        </button>
                        <Link href="/library" className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition">
                            Back to Library
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!deckId) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="text-red-500 bg-red-50 p-6 rounded-2xl max-w-md w-full">No deck ID provided in the URL.</div>
                <Link href="/library" className="mt-6 px-6 py-3 bg-slate-200 rounded-full font-semibold hover:bg-slate-300">Return to Library</Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <LoaderCircle className="w-10 h-10 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (error || !deck || cards.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="text-red-500 bg-red-50 p-6 rounded-2xl max-w-md w-full">{error || "No flashcards found in this deck."}</div>
                <Link href="/library" className="mt-6 px-6 py-3 bg-slate-200 rounded-full font-semibold hover:bg-slate-300">Return to Library</Link>
            </div>
        );
    }

    const currentCard = cards[currentIndex];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200 bg-white">
                <div className="flex items-center gap-6">
                    <Link href="/library" className="text-slate-400 hover:text-slate-800 transition bg-slate-50 p-2 rounded-full"><ArrowLeft className="w-5 h-5" /></Link>
                    <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg tracking-tight">
                        <Brain className="w-6 h-6" /> {deck.title}
                    </div>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                    <div className="flex items-center gap-1.5"><BookOpen className="w-4 h-4"/> 12 Due Today</div>
                    <div className="w-0.5 h-4 bg-slate-300"></div>
                    <div>Card {currentIndex + 1} of {cards.length}</div>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6">
                
                {/* Progress bar */}
                <div className="w-full max-w-2xl mb-8 flex justify-center">
                    <div className="w-full bg-slate-200/50 h-2 rounded-full overflow-hidden shadow-inner ring-1 ring-black/5 relative hover:scale-[1.01] transition-transform">
                        <div 
                            className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 h-full rounded-full transition-all duration-700 ease-in-out relative group overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                            style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                        </div>
                    </div>
                </div>

                {/* Flashcard */}
                <div 
                    onClick={handleFlip}
                    className="w-full max-w-2xl aspect-[4/3] sm:aspect-video perspective-1000 cursor-pointer group"
                >
                    <div className={`relative w-full h-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                        
                        {/* Front */}
                        <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-lg border border-slate-200 p-8 sm:p-12 flex flex-col items-center justify-center text-center">
                            <span className="absolute top-6 left-6 text-xs font-bold uppercase tracking-widest text-slate-400">Front</span>
                            <h2 className="text-2xl sm:text-4xl text-slate-800 font-semibold leading-relaxed">
                                {currentCard.front}
                            </h2>
                            <div className="absolute bottom-6 text-slate-400 text-sm font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                Click or spacebar to flip
                            </div>
                        </div>

                        {/* Back */}
                        <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-lg border-2 border-indigo-100 p-8 sm:p-12 flex flex-col items-center justify-center text-center rotate-y-180">
                            <span className="absolute top-6 left-6 text-xs font-bold uppercase tracking-widest text-indigo-400">Back</span>
                            <p className="text-xl sm:text-2xl text-slate-800 leading-relaxed font-medium">
                                {currentCard.back}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="w-full max-w-2xl mt-10 h-24">
                    {!isFlipped ? (
                        <button 
                            onClick={handleFlip}
                            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-md hover:bg-slate-800 hover:-translate-y-0.5 transition-all text-center"
                        >
                            Show Answer
                        </button>
                    ) : (
                        <div className="grid grid-cols-4 gap-3 sm:gap-4 h-full">
                            <button onClick={() => handleResponse('again')} className="flex flex-col items-center justify-center py-3 bg-white border border-rose-200 text-rose-700 rounded-2xl shadow-sm hover:bg-rose-50 transition">
                                <span className="font-bold">Again</span>
                                <span className="text-xs text-rose-400 mt-1">&lt; 1 min</span>
                            </button>
                            <button onClick={() => handleResponse('hard')} className="flex flex-col items-center justify-center py-3 bg-white border border-amber-200 text-amber-700 rounded-2xl shadow-sm hover:bg-amber-50 transition">
                                <span className="font-bold">Hard</span>
                                <span className="text-xs text-amber-400 mt-1">10 min</span>
                            </button>
                            <button onClick={() => handleResponse('good')} className="flex flex-col items-center justify-center py-3 bg-white border border-emerald-200 text-emerald-700 rounded-2xl shadow-sm hover:bg-emerald-50 transition">
                                <span className="font-bold">Good</span>
                                <span className="text-xs text-emerald-400 mt-1">1 day</span>
                            </button>
                            <button onClick={() => handleResponse('easy')} className="flex flex-col items-center justify-center py-3 bg-white border border-blue-200 text-blue-700 rounded-2xl shadow-sm hover:bg-blue-50 transition">
                                <span className="font-bold">Easy</span>
                                <span className="text-xs text-blue-400 mt-1">4 days</span>
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
