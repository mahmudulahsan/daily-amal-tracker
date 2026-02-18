"use client";

import { useState, useEffect, useCallback } from "react";
import { TrackerData, UserProfile } from "@/lib/types";
import {
  getUsers,
  getActiveUser,
  createUser,
  setActiveUserId,
  loadTrackerData,
  saveTrackerData,
} from "@/lib/storage";
import Header from "./Header";
import TrackerGrid from "./TrackerGrid";
import CustomizeModal from "./CustomizeModal";
import WelcomeModal from "./WelcomeModal";

export default function TrackerApp() {
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [data, setData] = useState<TrackerData | null>(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // ── Init: load user and their data ──
  useEffect(() => {
    const users = getUsers();
    if (users.length === 0) {
      setShowWelcome(true);
      setIsLoaded(true);
    } else {
      const active = getActiveUser();
      if (active) {
        setActiveUser(active);
        setData(loadTrackerData(active.id));
      }
      setIsLoaded(true);
    }
  }, []);

  // ── Reload current user's data ──
  const reloadData = useCallback((userId: string) => {
    setData(loadTrackerData(userId));
  }, []);

  // ── User lifecycle handlers ──

  const handleCreateFirstUser = useCallback((name: string) => {
    const user = createUser(name);
    setActiveUser(user);
    setData(loadTrackerData(user.id));
    setShowWelcome(false);
    // Sync to Supabase
    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, name }),
    }).then((r) => r.json()).catch(() => {});
  }, []);

  const handleSwitchUser = useCallback(
    (userId: string) => {
      setActiveUserId(userId);
      const users = getUsers();
      const user = users.find((u) => u.id === userId) || null;
      setActiveUser(user);
      if (user) reloadData(user.id);
    },
    [reloadData]
  );

  const handleUserCreated = useCallback(
    (user: UserProfile) => {
      setActiveUser(user);
      reloadData(user.id);
    },
    [reloadData]
  );

  const handleUserDeleted = useCallback(() => {
    const users = getUsers();
    if (users.length === 0) {
      setActiveUser(null);
      setData(null);
      setShowWelcome(true);
    } else {
      const active = getActiveUser();
      setActiveUser(active);
      if (active) reloadData(active.id);
    }
  }, [reloadData]);

  const handleUserRenamed = useCallback(
    (name: string) => {
      if (activeUser) {
        setActiveUser({ ...activeUser, name });
      }
    },
    [activeUser]
  );

  const handleDataImported = useCallback(() => {
    if (activeUser) reloadData(activeUser.id);
  }, [activeUser, reloadData]);

  // ── Tracker data handlers ──

  const toggleEntry = useCallback(
    (day: number, itemId: string) => {
      if (!activeUser) return;
      setData((prev) => {
        if (!prev) return prev;

        const dayKey = `day-${day}`;
        const entries = { ...prev.entries };
        entries[dayKey] = { ...entries[dayKey] };
        entries[dayKey][itemId] = !entries[dayKey][itemId];

        if (!entries[dayKey][itemId]) {
          delete entries[dayKey][itemId];
        }
        if (Object.keys(entries[dayKey]).length === 0) {
          delete entries[dayKey];
        }

        const newData = { ...prev, entries };
        saveTrackerData(activeUser.id, newData);
        return newData;
      });
    },
    [activeUser]
  );

  const handleSaveCustomize = useCallback(
    (newData: TrackerData) => {
      if (!activeUser) return;
      setData(newData);
      saveTrackerData(activeUser.id, newData);
      setShowCustomize(false);
    },
    [activeUser]
  );

  // ── Render ──

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-amber-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 animate-spin" />
          </div>
          <p className="text-slate-500 text-sm animate-pulse">
            আপনার ট্র্যাকার লোড হচ্ছে...
          </p>
        </div>
      </div>
    );
  }

  if (showWelcome) {
    return <WelcomeModal onCreateUser={handleCreateFirstUser} />;
  }

  if (!data || !activeUser) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-amber-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 animate-spin" />
          </div>
          <p className="text-slate-500 text-sm animate-pulse">
            আপনার ট্র্যাকার লোড হচ্ছে...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1120] flex flex-col">
      <Header
        data={data}
        activeUser={activeUser}
        onCustomize={() => setShowCustomize(true)}
        onSwitchUser={handleSwitchUser}
        onDataImported={handleDataImported}
        onUserCreated={handleUserCreated}
        onUserDeleted={handleUserDeleted}
        onUserRenamed={handleUserRenamed}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <TrackerGrid data={data} onToggle={toggleEntry} />
      </main>

      <footer className="relative z-10 border-t border-white/[0.06] bg-[#0b1120]">
        <div className="max-w-[1920px] mx-auto px-4 py-3 flex items-center justify-center gap-1.5 text-xs text-slate-600">
          <span>Developed by</span>
          <a
            href="https://www.linkedin.com/in/ahsanmahmudul/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors"
          >
            <span className="font-medium">Mahmudul Ahsan</span>
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </a>
        </div>
      </footer>

      {showCustomize && (
        <CustomizeModal
          data={data}
          onSave={handleSaveCustomize}
          onClose={() => setShowCustomize(false)}
        />
      )}
    </div>
  );
}
