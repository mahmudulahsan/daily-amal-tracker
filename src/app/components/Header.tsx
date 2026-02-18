"use client";

import { useState, useEffect } from "react";
import { TrackerData, UserProfile } from "@/lib/types";
import { RAMADAN_DAYS } from "@/lib/defaults";
import { getCurrentDates, AllDates } from "@/lib/dates";
import UserPanel from "./UserPanel";

interface HeaderProps {
  data: TrackerData;
  activeUser: UserProfile;
  onCustomize: () => void;
  onSwitchUser: (userId: string) => void;
  onDataImported: () => void;
  onUserCreated: (user: UserProfile) => void;
  onUserDeleted: () => void;
  onUserRenamed: (name: string) => void;
}

export default function Header({
  data,
  activeUser,
  onCustomize,
  onSwitchUser,
  onDataImported,
  onUserCreated,
  onUserDeleted,
  onUserRenamed,
}: HeaderProps) {
  const [dates, setDates] = useState<AllDates | null>(null);

  useEffect(() => {
    setDates(getCurrentDates());
    // Update at midnight
    const now = new Date();
    const msToMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() -
      now.getTime();
    const timer = setTimeout(() => {
      setDates(getCurrentDates());
    }, msToMidnight);
    return () => clearTimeout(timer);
  }, []);

  const totalPossible = data.items.length * RAMADAN_DAYS;
  let totalChecked = 0;
  for (const dayKey of Object.keys(data.entries)) {
    const dayEntries = data.entries[dayKey];
    for (const itemId of Object.keys(dayEntries)) {
      if (dayEntries[itemId]) totalChecked++;
    }
  }
  const completionPercent =
    totalPossible > 0 ? Math.round((totalChecked / totalPossible) * 100) : 0;

  const daysActive = Object.keys(data.entries).filter((k) => {
    const dayEntries = data.entries[k];
    return Object.values(dayEntries).some(Boolean);
  }).length;

  return (
    <header className="relative z-30 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] border-b border-white/[0.06]">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-amber-500/[0.04] blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-violet-500/[0.05] blur-3xl" />
        <div className="absolute top-4 right-[15%] w-1 h-1 rounded-full bg-amber-300/60 animate-pulse" />
        <div className="absolute top-8 right-[25%] w-0.5 h-0.5 rounded-full bg-white/40 animate-pulse" style={{ animationDelay: "0.5s" }} />
        <div className="absolute top-3 right-[35%] w-1 h-1 rounded-full bg-amber-200/40 animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-10 right-[10%] w-0.5 h-0.5 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-6 left-[20%] w-0.5 h-0.5 rounded-full bg-amber-300/30 animate-pulse" style={{ animationDelay: "0.8s" }} />
      </div>

      <div className="relative max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Title */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14">
              <span className="text-3xl sm:text-4xl" role="img" aria-label="চাঁদ">
                🌙
              </span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                দৈনিক রমাদান ট্র্যাকার
              </h1>
              <p className="text-sm text-slate-400 mt-0.5 italic">
                &ldquo;আল্লাহর কাছে সবচেয়ে প্রিয় আমল হলো — যা নিয়মিত করা হয়, যদিও তা অল্প হয়।&rdquo;
              </p>
            </div>
          </div>

          {/* Stats & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Stats pills */}
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.06]">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                  দিন
                </span>
                <span className="text-lg font-bold text-white">
                  {daysActive}
                  <span className="text-slate-500 text-sm font-normal">
                    /{RAMADAN_DAYS}
                  </span>
                </span>
              </div>
              <div className="flex flex-col items-center px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.06]">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                  সম্পন্ন
                </span>
                <span className="text-lg font-bold text-amber-400">
                  {completionPercent}
                  <span className="text-sm font-normal">%</span>
                </span>
              </div>
            </div>

            {/* User panel */}
            <UserPanel
              activeUser={activeUser}
              onSwitchUser={onSwitchUser}
              onDataImported={onDataImported}
              onUserCreated={onUserCreated}
              onUserDeleted={onUserDeleted}
              onUserRenamed={onUserRenamed}
            />

            {/* Customize button */}
            <button
              onClick={onCustomize}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.08] hover:border-white/[0.15] text-white text-sm font-medium transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              কাস্টমাইজ
            </button>
          </div>
        </div>

        {/* Date bar */}
        {dates && (
          <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Hijri date */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/[0.08] border border-amber-500/[0.12]">
              <svg className="w-3.5 h-3.5 text-amber-400/70 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span className="text-xs font-medium text-amber-300/90">
                {dates.hijri}
              </span>
              <span className="text-[10px] text-amber-400/40 font-medium">হিজরি</span>
            </div>

            {/* Bangla date */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/[0.12]">
              <svg className="w-3.5 h-3.5 text-emerald-400/70 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium text-emerald-300/90">
                {dates.bangla}
              </span>
              <span className="text-[10px] text-emerald-400/40 font-medium">বঙ্গাব্দ</span>
            </div>

            {/* English date */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/[0.08] border border-sky-500/[0.12]">
              <svg className="w-3.5 h-3.5 text-sky-400/70 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span className="text-xs font-medium text-sky-300/90">
                {dates.english}
              </span>
              <span className="text-[10px] text-sky-400/40 font-medium">ইংরেজি</span>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="mt-3 sm:mt-4">
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${completionPercent}%`,
                background:
                  "linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)",
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
