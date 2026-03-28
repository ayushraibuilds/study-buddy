'use client';

import { useState } from 'react';
import { BookOpen, Check, X, RotateCcw, Brain, Calendar, ChevronRight } from 'lucide-react';

type Flashcard = {
    id: string;
    front: string;
    back: string;
};

const DUMMY_CARDS: Flashcard[] = [
    { id: '1', front: 'What is the primary function of the Mitochondria?', back: 'It generates most of the chemical energy needed to power the cell\'s biochemical reactions (powerhouse of the cell).' },
    { id: '2', front: 'Explain the concept of "Spaced Repetition" in learning.', back: 'An evidence-based learning technique that incorporates increasing intervals of time between subsequent review of previously learned material to exploit the psychological spacing effect.' },
    { id: '3', front: 'What is the Time Complexity of Binary Search?', back: 'O(log n), where n is the number of elements in the array.' }
];

export default function StudySession() {
    const [cards] = useState<Flashcard[]>(DUMMY_CARDS);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);

    const handleFlip = () => setIsFlipped(!isFlipped);

    const handleResponse = (quality: 'again' | 'hard' | 'good' | 'easy') => {
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
                    <button 
                        onClick={() => { setCurrentIndex(0); setSessionComplete(false); setIsFlipped(false); }}
                        className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition"
                    >
                        <RotateCcw className="w-5 h-5" /> Start New Session
                    </button>
                </div>
            </div>
        );
    }

    const currentCard = cards[currentIndex];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200 bg-white">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg tracking-tight">
                    <Brain className="w-6 h-6" /> StudyBuddy 
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
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                            className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out" 
                            style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
                        />
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
