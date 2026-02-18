"use client";

import { useState, useRef, useEffect } from "react";
import { UserProfile } from "@/lib/types";
import {
  getUsers,
  downloadExport,
  importUserData,
  saveTrackerData,
  deleteUser,
  createUser,
  updateUserName,
} from "@/lib/storage";

interface UserPanelProps {
  activeUser: UserProfile;
  onSwitchUser: (userId: string) => void;
  onDataImported: () => void;
  onUserCreated: (user: UserProfile) => void;
  onUserDeleted: () => void;
  onUserRenamed: (name: string) => void;
}

export default function UserPanel({
  activeUser,
  onSwitchUser,
  onDataImported,
  onUserCreated,
  onUserDeleted,
  onUserRenamed,
}: UserPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(activeUser.name);
  const [showNewUser, setShowNewUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const users = getUsers();
  const initial = activeUser.name.charAt(0).toUpperCase();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setConfirmDelete(null);
        setImportError(null);
        setShowNewUser(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // ── Handlers ──

  const handleRename = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== activeUser.name) {
      updateUserName(activeUser.id, trimmed);
      onUserRenamed(trimmed);
      // Sync to Supabase
      fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: activeUser.id, name: trimmed }),
      }).then((r) => r.json()).catch(() => {});
    }
    setIsEditing(false);
  };

  const handleExport = () => {
    downloadExport(activeUser.id, activeUser.name);
    setIsOpen(false);
  };

  const handleImportClick = () => {
    setImportError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = importUserData(reader.result as string);
      if (result) {
        saveTrackerData(activeUser.id, result.data);
        onDataImported();
        setIsOpen(false);
        setImportError(null);
      } else {
        setImportError("ফাইলটি সঠিক নয়। অনুগ্রহ করে সঠিক JSON ফাইল দিন।");
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleAddUser = () => {
    const trimmed = newUserName.trim();
    if (trimmed) {
      const user = createUser(trimmed);
      onUserCreated(user);
      setNewUserName("");
      setShowNewUser(false);
      setIsOpen(false);
      // Sync to Supabase
      fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, name: trimmed }),
      }).then((r) => r.json()).catch(() => {});
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (confirmDelete !== userId) {
      setConfirmDelete(userId);
      return;
    }
    deleteUser(userId);
    setConfirmDelete(null);
    if (userId === activeUser.id) {
      onUserDeleted();
    }
    // Force re-render by closing and reopening
    setIsOpen(false);
    // Sync to Supabase
    fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId }),
    }).then((r) => r.json()).catch(() => {});
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.08] hover:border-white/[0.15] transition-all duration-200 cursor-pointer"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
        >
          {initial}
        </div>
        <span className="text-sm font-medium text-white max-w-[100px] truncate">
          {activeUser.name}
        </span>
        <svg
          className="w-3.5 h-3.5 text-slate-400 transition-transform duration-200"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Backdrop (mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown panel */}
      {isOpen && (
        <div className="fixed left-3 right-3 bottom-3 sm:absolute sm:left-auto sm:right-0 sm:bottom-auto sm:top-full sm:mt-2 w-auto sm:w-72 bg-[#1a2235] rounded-xl border border-white/[0.08] shadow-2xl overflow-hidden z-50 max-h-[80vh] overflow-y-auto">
          {/* Current user */}
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                }}
              >
                {initial}
              </div>
              {isEditing ? (
                <div className="flex-1 flex items-center gap-1">
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename();
                      if (e.key === "Escape") {
                        setIsEditing(false);
                        setEditName(activeUser.name);
                      }
                    }}
                    className="flex-1 bg-white/[0.06] rounded-lg px-2 py-1 text-sm text-white outline-none border border-white/10 focus:border-amber-500/50"
                  />
                  <button
                    onClick={handleRename}
                    className="text-xs text-amber-400 hover:text-amber-300 px-1 cursor-pointer"
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-white truncate">
                      {activeUser.name}
                    </span>
                    <button
                      onClick={() => {
                        setEditName(activeUser.name);
                        setIsEditing(true);
                      }}
                      className="text-slate-600 hover:text-amber-400 transition-colors cursor-pointer shrink-0"
                      title="নাম পরিবর্তন"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-600">সক্রিয় ব্যবহারকারী</span>
                </div>
              )}
            </div>
          </div>

          {/* Export / Import */}
          <div className="px-2 py-2 border-b border-white/[0.06]">
            <button
              onClick={handleExport}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              ডেটা ডাউনলোড করুন
            </button>
            <button
              onClick={handleImportClick}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              ডেটা আপলোড করুন
            </button>
            {importError && (
              <p className="text-xs text-rose-400 px-3 py-1">{importError}</p>
            )}
          </div>

          {/* User list */}
          {users.length > 1 && (
            <div className="px-2 py-2 border-b border-white/[0.06]">
              <p className="px-3 py-1 text-[11px] text-slate-600 uppercase tracking-wider font-medium">
                ব্যবহারকারী পরিবর্তন
              </p>
              {users.map((user) => {
                const isActive = user.id === activeUser.id;
                const userInitial = user.name.charAt(0).toUpperCase();
                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg group/user"
                  >
                    <button
                      onClick={() => {
                        if (!isActive) {
                          onSwitchUser(user.id);
                          setIsOpen(false);
                        }
                      }}
                      className={`flex-1 flex items-center gap-2 text-sm transition-colors ${
                        isActive
                          ? "text-amber-400 cursor-default"
                          : "text-slate-400 hover:text-white cursor-pointer"
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{
                          background: isActive
                            ? "linear-gradient(135deg, #f59e0b, #d97706)"
                            : "rgba(255,255,255,0.1)",
                        }}
                      >
                        {userInitial}
                      </div>
                      <span className="truncate">{user.name}</span>
                      {isActive && (
                        <span className="text-[10px] text-amber-500/60">✓</span>
                      )}
                    </button>
                    {!isActive && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className={`shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer ${
                          confirmDelete === user.id
                            ? "text-rose-400 bg-rose-400/10"
                            : "text-slate-700 hover:text-rose-400 opacity-0 group-hover/user:opacity-100"
                        }`}
                        title={
                          confirmDelete === user.id
                            ? "আবার ক্লিক করুন নিশ্চিত করতে"
                            : "ব্যবহারকারী মুছুন"
                        }
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add new user */}
          <div className="px-2 py-2">
            {showNewUser ? (
              <div className="flex items-center gap-2 px-3 py-1.5">
                <input
                  autoFocus
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddUser();
                    if (e.key === "Escape") {
                      setShowNewUser(false);
                      setNewUserName("");
                    }
                  }}
                  placeholder="নাম লিখুন..."
                  className="flex-1 bg-white/[0.06] rounded-lg px-2.5 py-1.5 text-sm text-white outline-none border border-white/10 focus:border-amber-500/50 placeholder-slate-600"
                />
                <button
                  onClick={handleAddUser}
                  disabled={!newUserName.trim()}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  style={{
                    background: newUserName.trim()
                      ? "linear-gradient(135deg, #f59e0b, #d97706)"
                      : "rgba(255,255,255,0.05)",
                  }}
                >
                  যোগ
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowNewUser(true)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-amber-400 hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                নতুন প্রোফাইল যোগ করুন
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
