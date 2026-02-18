"use client";

import { useState } from "react";
import { TrackerData, IbadahCategory, IbadahItem } from "@/lib/types";
import { getDefaultData } from "@/lib/storage";
import { availableColors, getColor, ColorName } from "@/lib/colors";

interface CustomizeModalProps {
  data: TrackerData;
  onSave: (data: TrackerData) => void;
  onClose: () => void;
}

export default function CustomizeModal({
  data,
  onSave,
  onClose,
}: CustomizeModalProps) {
  const [categories, setCategories] = useState<IbadahCategory[]>(
    data.categories.map((c) => ({ ...c }))
  );
  const [items, setItems] = useState<IbadahItem[]>(
    data.items.map((i) => ({ ...i }))
  );
  const [expandedCats, setExpandedCats] = useState<Set<string>>(
    new Set()
  );
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // ── Helpers ──

  const getTopLevelItems = (categoryId: string) => {
    const catItems = items.filter((i) => i.categoryId === categoryId);
    const catItemIds = new Set(catItems.map((i) => i.id));
    return catItems.filter((i) => !i.parentId || !catItemIds.has(i.parentId));
  };

  const getChildren = (parentId: string) => {
    return items.filter((i) => i.parentId === parentId);
  };

  // ── Category operations ──

  const addCategory = () => {
    const id = `cat-${Date.now()}`;
    const newCat: IbadahCategory = {
      id,
      name: "নতুন ক্যাটাগরি",
      color: "teal",
    };
    setCategories([...categories, newCat]);
    setExpandedCats((prev) => new Set([...prev, id]));
    setEditingCatId(id);
  };

  const updateCategory = (id: string, updates: Partial<IbadahCategory>) => {
    setCategories(
      categories.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
    setItems(items.filter((i) => i.categoryId !== id));
  };

  const moveCategoryUp = (idx: number) => {
    if (idx === 0) return;
    const newCats = [...categories];
    [newCats[idx - 1], newCats[idx]] = [newCats[idx], newCats[idx - 1]];
    setCategories(newCats);
  };

  const moveCategoryDown = (idx: number) => {
    if (idx >= categories.length - 1) return;
    const newCats = [...categories];
    [newCats[idx], newCats[idx + 1]] = [newCats[idx + 1], newCats[idx]];
    setCategories(newCats);
  };

  // ── Item operations ──

  const addItem = (categoryId: string) => {
    const newItem: IbadahItem = {
      id: `item-${Date.now()}`,
      name: "নতুন আইটেম",
      categoryId,
    };
    setItems([...items, newItem]);
  };

  const addSubItem = (parentItem: IbadahItem) => {
    const newItem: IbadahItem = {
      id: `item-${Date.now()}-sub`,
      name: "নতুন সাব-আইটেম",
      categoryId: parentItem.categoryId,
      parentId: parentItem.id,
    };
    const newItems = [...items];
    const parentIdx = newItems.findIndex((i) => i.id === parentItem.id);
    let insertIdx = parentIdx + 1;
    while (
      insertIdx < newItems.length &&
      newItems[insertIdx].parentId === parentItem.id
    ) {
      insertIdx++;
    }
    newItems.splice(insertIdx, 0, newItem);
    setItems(newItems);
  };

  const updateItem = (id: string, updates: Partial<IbadahItem>) => {
    setItems(items.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id && i.parentId !== id));
  };

  const moveTopLevelItemUp = (categoryId: string, item: IbadahItem) => {
    const topLevel = getTopLevelItems(categoryId);
    const idx = topLevel.findIndex((i) => i.id === item.id);
    if (idx <= 0) return;
    const sibling = topLevel[idx - 1];
    const itemGroup = [item, ...items.filter((i) => i.parentId === item.id)];
    const siblingGroup = [
      sibling,
      ...items.filter((i) => i.parentId === sibling.id),
    ];
    const withoutBoth = items.filter(
      (i) =>
        !itemGroup.find((g) => g.id === i.id) &&
        !siblingGroup.find((g) => g.id === i.id)
    );
    const origSiblingIdx = items.findIndex((i) => i.id === sibling.id);
    let cleanInsertIdx = 0;
    for (let k = 0; k < origSiblingIdx; k++) {
      if (
        !itemGroup.find((g) => g.id === items[k].id) &&
        !siblingGroup.find((g) => g.id === items[k].id)
      ) {
        cleanInsertIdx++;
      }
    }
    withoutBoth.splice(cleanInsertIdx, 0, ...itemGroup, ...siblingGroup);
    setItems(withoutBoth);
  };

  const moveTopLevelItemDown = (categoryId: string, item: IbadahItem) => {
    const topLevel = getTopLevelItems(categoryId);
    const idx = topLevel.findIndex((i) => i.id === item.id);
    if (idx >= topLevel.length - 1) return;
    const sibling = topLevel[idx + 1];
    moveTopLevelItemUp(categoryId, sibling);
  };

  const moveSubItemUp = (item: IbadahItem) => {
    if (!item.parentId) return;
    const siblings = getChildren(item.parentId);
    const idx = siblings.findIndex((i) => i.id === item.id);
    if (idx <= 0) return;
    const sibling = siblings[idx - 1];
    const newItems = [...items];
    const idxA = newItems.findIndex((i) => i.id === item.id);
    const idxB = newItems.findIndex((i) => i.id === sibling.id);
    [newItems[idxA], newItems[idxB]] = [newItems[idxB], newItems[idxA]];
    setItems(newItems);
  };

  const moveSubItemDown = (item: IbadahItem) => {
    if (!item.parentId) return;
    const siblings = getChildren(item.parentId);
    const idx = siblings.findIndex((i) => i.id === item.id);
    if (idx >= siblings.length - 1) return;
    const sibling = siblings[idx + 1];
    const newItems = [...items];
    const idxA = newItems.findIndex((i) => i.id === item.id);
    const idxB = newItems.findIndex((i) => i.id === sibling.id);
    [newItems[idxA], newItems[idxB]] = [newItems[idxB], newItems[idxA]];
    setItems(newItems);
  };

  const toggleExpand = (catId: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  // ── Save & Reset ──

  const handleSave = () => {
    const newData: TrackerData = { ...data, categories, items };
    const validItemIds = new Set(items.map((i) => i.id));
    const cleanedEntries: typeof data.entries = {};
    for (const dayKey of Object.keys(newData.entries)) {
      cleanedEntries[dayKey] = {};
      for (const itemId of Object.keys(newData.entries[dayKey])) {
        if (validItemIds.has(itemId)) {
          cleanedEntries[dayKey][itemId] = newData.entries[dayKey][itemId];
        }
      }
    }
    newData.entries = cleanedEntries;
    onSave(newData);
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    const defaults = getDefaultData();
    setCategories(defaults.categories);
    setItems(defaults.items);
    setConfirmReset(false);
  };

  // ── Reusable icons ──

  const ArrowUp = () => (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  );
  const ArrowDown = () => (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
  const XIcon = () => (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
  const PlusIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-[#111827] rounded-2xl shadow-2xl border border-white/[0.08] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-lg font-bold text-white">
              ট্র্যাকার কাস্টমাইজ
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              ক্যাটাগরি, আইটেম এবং সাব-আইটেম যোগ, সম্পাদনা বা মুছুন
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-6 py-4 space-y-3 custom-scrollbar">
          {categories.map((cat, catIdx) => {
            const catColor = getColor(cat.color);
            const topLevelItems = getTopLevelItems(cat.id);
            const allCatItems = items.filter((i) => i.categoryId === cat.id);
            const isExpanded = expandedCats.has(cat.id);

            return (
              <div
                key={cat.id}
                className="rounded-xl border"
                style={{
                  borderColor: `${catColor.main}25`,
                  backgroundColor: `${catColor.main}06`,
                }}
              >
                {/* Category header */}
                <div
                  className="flex items-center gap-2 px-4 py-3 cursor-pointer"
                  onClick={() => toggleExpand(cat.id)}
                >
                  <svg
                    className="w-4 h-4 text-slate-500 transition-transform duration-200"
                    style={{
                      transform: isExpanded
                        ? "rotate(90deg)"
                        : "rotate(0deg)",
                    }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>

                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowColorPicker(
                          showColorPicker === cat.id ? null : cat.id
                        );
                      }}
                      className="w-4 h-4 rounded-full border-2 border-white/20 hover:border-white/40 transition-colors cursor-pointer"
                      style={{ backgroundColor: catColor.main }}
                      title="রঙ পরিবর্তন"
                    />
                    {showColorPicker === cat.id && (
                      <div
                        className="absolute top-7 left-0 z-50 p-2 rounded-lg bg-[#1e293b] border border-white/10 shadow-xl flex flex-wrap gap-1.5 w-[180px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {availableColors.map((colorName) => {
                          const c = getColor(colorName);
                          return (
                            <button
                              key={colorName}
                              onClick={() => {
                                updateCategory(cat.id, { color: colorName });
                                setShowColorPicker(null);
                              }}
                              className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer"
                              style={{
                                backgroundColor: c.main,
                                borderColor:
                                  cat.color === colorName
                                    ? "white"
                                    : "transparent",
                              }}
                              title={colorName}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {editingCatId === cat.id ? (
                    <input
                      autoFocus
                      value={cat.name}
                      onChange={(e) =>
                        updateCategory(cat.id, { name: e.target.value })
                      }
                      onBlur={() => setEditingCatId(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setEditingCatId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 bg-transparent text-sm font-semibold outline-none border-b border-white/20 focus:border-amber-400/60 px-1 py-0.5 transition-colors"
                      style={{ color: catColor.text }}
                    />
                  ) : (
                    <span
                      className="flex-1 text-sm font-semibold cursor-text"
                      style={{ color: catColor.text }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCatId(cat.id);
                      }}
                    >
                      {cat.name}
                    </span>
                  )}

                  <span className="text-xs text-slate-600 tabular-nums">
                    {allCatItems.length}টি আইটেম
                  </span>

                  <div
                    className="flex items-center gap-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => moveCategoryUp(catIdx)}
                      disabled={catIdx === 0}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/[0.06] disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-colors cursor-pointer disabled:cursor-default"
                      title="উপরে সরান"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveCategoryDown(catIdx)}
                      disabled={catIdx === categories.length - 1}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/[0.06] disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-colors cursor-pointer disabled:cursor-default"
                      title="নিচে সরান"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setEditingCatId(cat.id)}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-amber-400 hover:bg-white/[0.06] transition-colors cursor-pointer"
                      title="নাম পরিবর্তন"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-white/[0.06] transition-colors cursor-pointer"
                      title="ক্যাটাগরি মুছুন"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Items tree */}
                {isExpanded && (
                  <div
                    className="border-t px-4 pb-3 pt-1"
                    style={{ borderColor: `${catColor.main}15` }}
                  >
                    {topLevelItems.map((item, itemIdx) => {
                      const children = getChildren(item.id);

                      return (
                        <div key={item.id}>
                          {/* Parent item */}
                          <div className="flex items-center gap-2 py-1.5 group/item">
                            <div
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{
                                backgroundColor: catColor.main,
                                opacity: children.length > 0 ? 0.7 : 0.3,
                              }}
                            />
                            <input
                              value={item.name}
                              onChange={(e) =>
                                updateItem(item.id, { name: e.target.value })
                              }
                              className={`flex-1 bg-transparent text-sm outline-none border-b border-transparent focus:border-white/20 px-1 py-0.5 transition-colors hover:text-slate-300 ${
                                children.length > 0
                                  ? "text-slate-300 font-medium"
                                  : "text-slate-400"
                              }`}
                            />
                            <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                              <button
                                onClick={() => addSubItem(item)}
                                className="h-5 px-1.5 rounded flex items-center justify-center gap-1 text-slate-600 hover:text-amber-400 hover:bg-white/[0.06] transition-colors cursor-pointer"
                                title="সাব-আইটেম যোগ"
                              >
                                <PlusIcon />
                                <span className="text-[10px] font-medium">
                                  সাব
                                </span>
                              </button>
                              <button
                                onClick={() =>
                                  moveTopLevelItemUp(cat.id, item)
                                }
                                disabled={itemIdx === 0}
                                className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:text-white hover:bg-white/[0.06] disabled:opacity-20 transition-colors cursor-pointer disabled:cursor-default"
                              >
                                <ArrowUp />
                              </button>
                              <button
                                onClick={() =>
                                  moveTopLevelItemDown(cat.id, item)
                                }
                                disabled={
                                  itemIdx >= topLevelItems.length - 1
                                }
                                className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:text-white hover:bg-white/[0.06] disabled:opacity-20 transition-colors cursor-pointer disabled:cursor-default"
                              >
                                <ArrowDown />
                              </button>
                              <button
                                onClick={() => deleteItem(item.id)}
                                className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:text-rose-400 hover:bg-white/[0.06] transition-colors cursor-pointer"
                                title={
                                  children.length > 0
                                    ? "আইটেম ও সাব-আইটেম মুছুন"
                                    : "আইটেম মুছুন"
                                }
                              >
                                <XIcon />
                              </button>
                            </div>
                          </div>

                          {/* Sub-items */}
                          {children.length > 0 && (
                            <div
                              className="ml-3 pl-3 border-l"
                              style={{ borderColor: `${catColor.main}20` }}
                            >
                              {children.map((child, childIdx) => (
                                <div
                                  key={child.id}
                                  className="flex items-center gap-2 py-1 group/sub"
                                >
                                  <span
                                    className="text-[10px] leading-none select-none shrink-0"
                                    style={{ color: `${catColor.main}40` }}
                                  >
                                    {childIdx === children.length - 1
                                      ? "└"
                                      : "├"}
                                  </span>
                                  <input
                                    value={child.name}
                                    onChange={(e) =>
                                      updateItem(child.id, {
                                        name: e.target.value,
                                      })
                                    }
                                    className="flex-1 bg-transparent text-[13px] text-slate-500 outline-none border-b border-transparent focus:border-white/20 px-1 py-0.5 transition-colors hover:text-slate-400"
                                  />
                                  <div className="flex items-center gap-0.5 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => moveSubItemUp(child)}
                                      disabled={childIdx === 0}
                                      className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:text-white hover:bg-white/[0.06] disabled:opacity-20 transition-colors cursor-pointer disabled:cursor-default"
                                    >
                                      <ArrowUp />
                                    </button>
                                    <button
                                      onClick={() => moveSubItemDown(child)}
                                      disabled={
                                        childIdx >= children.length - 1
                                      }
                                      className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:text-white hover:bg-white/[0.06] disabled:opacity-20 transition-colors cursor-pointer disabled:cursor-default"
                                    >
                                      <ArrowDown />
                                    </button>
                                    <button
                                      onClick={() => deleteItem(child.id)}
                                      className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:text-rose-400 hover:bg-white/[0.06] transition-colors cursor-pointer"
                                      title="সাব-আইটেম মুছুন"
                                    >
                                      <XIcon />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Add item button */}
                    <button
                      onClick={() => addItem(cat.id)}
                      className="flex items-center gap-2 mt-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer hover:bg-white/[0.04]"
                      style={{ color: catColor.vivid }}
                    >
                      <PlusIcon />
                      আইটেম যোগ করুন
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add category button */}
          <button
            onClick={addCategory}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-dashed border-white/10 text-sm font-medium text-slate-500 hover:text-amber-400 hover:border-amber-400/30 hover:bg-amber-400/[0.03] transition-all duration-200 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            ক্যাটাগরি যোগ করুন
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06] bg-white/[0.02]">
          <button
            onClick={handleReset}
            className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              confirmReset
                ? "text-rose-400 bg-rose-400/10 hover:bg-rose-400/20"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
            }`}
          >
            {confirmReset ? "রিসেট নিশ্চিত করুন?" : "ডিফল্টে রিসেট করুন"}
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
              }}
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
