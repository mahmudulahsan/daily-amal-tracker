"use client";

import { useState } from "react";

interface WelcomeModalProps {
  onCreateUser: (name: string) => void;
}

export default function WelcomeModal({ onCreateUser }: WelcomeModalProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) {
      onCreateUser(trimmed);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-500/[0.03] blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-500/[0.04] blur-3xl" />
        {/* Stars */}
        <div className="absolute top-[15%] right-[20%] w-1 h-1 rounded-full bg-amber-300/50 animate-pulse" />
        <div className="absolute top-[25%] left-[30%] w-0.5 h-0.5 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: "0.7s" }} />
        <div className="absolute bottom-[30%] right-[35%] w-1 h-1 rounded-full bg-amber-200/40 animate-pulse" style={{ animationDelay: "1.2s" }} />
        <div className="absolute top-[40%] left-[15%] w-0.5 h-0.5 rounded-full bg-white/20 animate-pulse" style={{ animationDelay: "0.3s" }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-[#111827] rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden">
          {/* Header area */}
          <div className="px-8 pt-10 pb-6 text-center">
            <div className="text-5xl mb-4">🌙</div>
            <h1 className="text-2xl font-bold text-white mb-1">
              আসসালামু আলাইকুম!
            </h1>
            <p className="text-slate-400 text-sm">
              দৈনিক রমাদান ট্র্যাকারে আপনাকে স্বাগতম
            </p>
            <p className="text-slate-500 text-xs mt-2 italic">
              &ldquo;আল্লাহর কাছে সবচেয়ে প্রিয় আমল হলো — যা নিয়মিত করা হয়, যদিও তা অল্প হয়।&rdquo;
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8">
            <label
              htmlFor="user-name"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              আপনার নাম লিখুন
            </label>
            <input
              id="user-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: মাহী"
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder-slate-600 outline-none focus:border-amber-500/50 focus:bg-white/[0.07] transition-all text-sm"
            />
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full mt-4 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: name.trim()
                  ? "linear-gradient(135deg, #f59e0b, #d97706)"
                  : "rgba(255,255,255,0.05)",
              }}
            >
              শুরু করুন
            </button>

            {/* Info notice */}
            <div className="mt-5 flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-sky-500/[0.06] border border-sky-500/[0.1]">
              <svg className="w-4 h-4 text-sky-400/70 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[12px] leading-relaxed text-sky-300/70">
                আপনার সকল তথ্য এই ব্রাউজারের <span className="font-semibold text-sky-300/90">লোকাল স্টোরেজে</span> সংরক্ষিত থাকবে। আপনি যেকোনো সময় আপনার ডেটা <span className="font-semibold text-sky-300/90">ডাউনলোড</span> এবং <span className="font-semibold text-sky-300/90">আপলোড</span> করতে পারবেন।
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
