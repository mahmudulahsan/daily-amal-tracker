"use client";

import { TrackerData, IbadahItem } from "@/lib/types";
import { RAMADAN_DAYS } from "@/lib/defaults";
import { getColor, ColorValues } from "@/lib/colors";
import { useMemo, useCallback, useState } from "react";

/* ── Helpers ── */

interface ItemNode {
  item: IbadahItem;
  children: IbadahItem[];
}

/** Build a tree of parent → children for a given category. */
function buildItemTree(items: IbadahItem[], categoryId: string): ItemNode[] {
  const catItems = items.filter((i) => i.categoryId === categoryId);
  const catItemIds = new Set(catItems.map((i) => i.id));

  const topLevel = catItems.filter(
    (i) => !i.parentId || !catItemIds.has(i.parentId)
  );

  const childrenMap = new Map<string, IbadahItem[]>();
  for (const item of catItems) {
    if (item.parentId && catItemIds.has(item.parentId)) {
      const existing = childrenMap.get(item.parentId) || [];
      existing.push(item);
      childrenMap.set(item.parentId, existing);
    }
  }

  return topLevel.map((item) => ({
    item,
    children: childrenMap.get(item.id) || [],
  }));
}

/* ── Bangla numerals helper ── */
const toBanglaNum = (n: number): string => {
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n)
    .split("")
    .map((d) => banglaDigits[parseInt(d)] ?? d)
    .join("");
};

/* ── Main Grid ── */

interface TrackerGridProps {
  data: TrackerData;
  onToggle: (day: number, itemId: string) => void;
}

const COLLAPSED_KEY = "ramadan-tracker-collapsed";

function loadCollapsed(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(COLLAPSED_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveCollapsed(collapsed: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COLLAPSED_KEY, JSON.stringify(collapsed));
  } catch {}
}

export default function TrackerGrid({ data, onToggle }: TrackerGridProps) {
  const days = Array.from({ length: RAMADAN_DAYS }, (_, i) => i + 1);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(loadCollapsed);

  const toggleCollapse = useCallback((categoryId: string) => {
    setCollapsed((prev) => {
      const next = { ...prev, [categoryId]: !prev[categoryId] };
      saveCollapsed(next);
      return next;
    });
  }, []);

  const categoryTrees = useMemo(() => {
    return data.categories.map((category) => ({
      category,
      tree: buildItemTree(data.items, category.id),
    }));
  }, [data.categories, data.items]);

  const getCategoryStats = useCallback(
    (categoryId: string) => {
      const items = data.items.filter((i) => i.categoryId === categoryId);
      const totalPossible = items.length * RAMADAN_DAYS;
      let totalChecked = 0;
      for (const dayKey of Object.keys(data.entries)) {
        const dayEntries = data.entries[dayKey];
        for (const item of items) {
          if (dayEntries[item.id]) totalChecked++;
        }
      }
      return totalPossible > 0
        ? Math.round((totalChecked / totalPossible) * 100)
        : 0;
    },
    [data.items, data.entries]
  );

  const isChecked = useCallback(
    (day: number, itemId: string) => {
      return !!data.entries[`day-${day}`]?.[itemId];
    },
    [data.entries]
  );

  const getDayCompletion = useCallback(
    (day: number) => {
      const dayKey = `day-${day}`;
      const dayEntries = data.entries[dayKey];
      if (!dayEntries) return 0;
      const checked = Object.values(dayEntries).filter(Boolean).length;
      return data.items.length > 0
        ? Math.round((checked / data.items.length) * 100)
        : 0;
    },
    [data.entries, data.items.length]
  );

  if (data.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-slate-300 mb-2">
          এখনও কোনো ইবাদাত আইটেম নেই
        </h3>
        <p className="text-slate-500 max-w-md">
          ট্র্যাক করার জন্য হেডারে &ldquo;কাস্টমাইজ&rdquo; বাটনে ক্লিক করে
          ক্যাটাগরি ও আইটেম যোগ করুন।
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="min-w-max">
        <table className="w-full border-collapse">
          {/* Header row with day numbers */}
          <thead className="sticky top-0 z-20">
            <tr>
              <th className="sticky left-0 z-30 min-w-[240px] max-w-[240px] bg-[#0d1321] border-b border-r border-white/[0.06] px-4 py-3 text-left">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  ইবাদাত
                </span>
              </th>
              {days.map((day) => {
                const completion = getDayCompletion(day);
                return (
                  <th
                    key={day}
                    className="min-w-[44px] w-[44px] bg-[#0d1321] border-b border-white/[0.06] p-0"
                  >
                    <div className="flex flex-col items-center py-2 px-1">
                      <span className="text-[10px] text-slate-500 font-medium mb-0.5">
                        দিন
                      </span>
                      <span className="text-sm font-bold text-slate-300">
                        {toBanglaNum(day)}
                      </span>
                      {completion > 0 && (
                        <div
                          className="mt-1 w-5 h-1 rounded-full overflow-hidden bg-white/[0.06]"
                          title={`${toBanglaNum(completion)}% সম্পন্ন`}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${completion}%`,
                              backgroundColor:
                                completion === 100 ? "#10b981" : "#f59e0b",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {categoryTrees.map(({ category, tree }) => {
              const totalItems = tree.reduce(
                (sum, node) => sum + 1 + node.children.length,
                0
              );
              if (totalItems === 0) return null;

              const color = getColor(category.color);
              const categoryPercent = getCategoryStats(category.id);

              return (
                <CategorySection
                  key={category.id}
                  categoryId={category.id}
                  categoryName={category.name}
                  color={color}
                  categoryPercent={categoryPercent}
                  tree={tree}
                  days={days}
                  isChecked={isChecked}
                  onToggle={onToggle}
                  isCollapsed={!!collapsed[category.id]}
                  onToggleCollapse={toggleCollapse}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Category Section ── */

interface CategorySectionProps {
  categoryId: string;
  categoryName: string;
  color: ColorValues;
  categoryPercent: number;
  tree: ItemNode[];
  days: number[];
  isChecked: (day: number, itemId: string) => boolean;
  onToggle: (day: number, itemId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: (categoryId: string) => void;
}

function CategorySection({
  categoryId,
  categoryName,
  color,
  categoryPercent,
  tree,
  days,
  isChecked,
  onToggle,
  isCollapsed,
  onToggleCollapse,
}: CategorySectionProps) {
  const flatList: {
    item: IbadahItem;
    depth: number;
    isLast: boolean;
  }[] = [];
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    flatList.push({
      item: node.item,
      depth: 0,
      isLast: i === tree.length - 1 && node.children.length === 0,
    });
    for (let j = 0; j < node.children.length; j++) {
      flatList.push({
        item: node.children[j],
        depth: 1,
        isLast: j === node.children.length - 1,
      });
    }
  }

  return (
    <>
      {/* Category header */}
      <tr>
        <td
          colSpan={RAMADAN_DAYS + 1}
          className="sticky left-0 z-10"
          style={{ backgroundColor: color.light }}
        >
          <button
            type="button"
            onClick={() => onToggleCollapse(categoryId)}
            className="w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer text-left transition-opacity hover:opacity-90"
            style={{ background: "none", border: "none" }}
            aria-expanded={!isCollapsed}
          >
            <div
              className="w-1 h-5 rounded-full shrink-0"
              style={{ backgroundColor: color.main }}
            />
            <svg
              className="w-3.5 h-3.5 shrink-0 transition-transform duration-200"
              style={{
                color: color.text,
                transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
              }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            <span
              className="text-sm font-semibold tracking-wide"
              style={{ color: color.text }}
            >
              {categoryName}
            </span>
            <span
              className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: color.light,
                color: color.vivid,
                border: `1px solid ${color.main}30`,
              }}
            >
              {toBanglaNum(categoryPercent)}%
            </span>
          </button>
        </td>
      </tr>

      {/* Item rows */}
      {!isCollapsed && flatList.map(({ item, depth, isLast }, flatIdx) => {
        const hasChildren =
          depth === 0 &&
          tree.find((n) => n.item.id === item.id)?.children.length;

        return (
          <tr
            key={item.id}
            className="group transition-colors duration-100 hover:bg-white/[0.02]"
            style={{
              borderBottom:
                flatIdx === flatList.length - 1
                  ? "none"
                  : "1px solid rgba(255,255,255,0.03)",
            }}
          >
            {/* Item name cell — sticky left */}
            <td
              className="sticky left-0 z-10 min-w-[240px] max-w-[240px] border-r border-white/[0.04] py-0"
              style={{ backgroundColor: "#111827" }}
            >
              {depth === 0 ? (
                <div
                  className="flex items-center gap-2 py-[7px]"
                  style={{ paddingLeft: "16px" }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: color.main,
                      opacity: hasChildren ? 0.8 : 0.4,
                    }}
                  />
                  <span
                    className={`text-[13px] truncate leading-tight group-hover:text-slate-300 transition-colors ${
                      hasChildren
                        ? "text-slate-300 font-medium"
                        : "text-slate-400"
                    }`}
                  >
                    {item.name}
                  </span>
                </div>
              ) : (
                <div
                  className="flex items-center py-[6px]"
                  style={{ paddingLeft: "24px" }}
                >
                  <div className="flex items-center mr-1.5 shrink-0">
                    <span
                      className="text-[11px] leading-none select-none"
                      style={{ color: `${color.main}50` }}
                    >
                      {isLast ? "└" : "├"}
                    </span>
                    <span
                      className="inline-block w-2 border-t shrink-0"
                      style={{ borderColor: `${color.main}30` }}
                    />
                  </div>
                  <span className="text-[12px] text-slate-500 truncate leading-tight group-hover:text-slate-400 transition-colors">
                    {item.name}
                  </span>
                </div>
              )}
            </td>

            {/* Day cells */}
            {days.map((day) => {
              const checked = isChecked(day, item.id);
              const size = depth === 0 ? 28 : 24;
              const iconSize = depth === 0 ? 14 : 11;
              return (
                <td
                  key={day}
                  className="min-w-[44px] w-[44px] p-0 text-center"
                >
                  <div className="flex items-center justify-center h-[36px]">
                    <button
                      onClick={() => onToggle(day, item.id)}
                      className="tracker-cb group/cb relative flex items-center justify-center cursor-pointer outline-none"
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        borderRadius: depth === 0 ? "8px" : "6px",
                        transition:
                          "transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease, background 0.2s ease, border-color 0.2s ease",
                        ...(checked
                          ? {
                              background: `linear-gradient(135deg, ${color.vivid}, ${color.main})`,
                              border: "none",
                              boxShadow: `0 0 10px ${color.main}40, inset 0 1px 1px rgba(255,255,255,0.15)`,
                              transform: "scale(1)",
                            }
                          : {
                              background: "rgba(255,255,255,0.02)",
                              border: `1.5px solid rgba(255,255,255,${depth === 0 ? "0.08" : "0.06"})`,
                              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.2)",
                              transform: "scale(1)",
                            }),
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget;
                        if (checked) {
                          el.style.boxShadow = `0 0 16px ${color.main}60, inset 0 1px 1px rgba(255,255,255,0.2)`;
                          el.style.transform = "scale(1.08)";
                        } else {
                          el.style.borderColor = `${color.main}50`;
                          el.style.background = `linear-gradient(135deg, ${color.main}12, ${color.main}08)`;
                          el.style.boxShadow = `0 0 8px ${color.main}15, inset 0 1px 2px rgba(0,0,0,0.15)`;
                          el.style.transform = "scale(1.08)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget;
                        if (checked) {
                          el.style.boxShadow = `0 0 10px ${color.main}40, inset 0 1px 1px rgba(255,255,255,0.15)`;
                          el.style.transform = "scale(1)";
                        } else {
                          el.style.borderColor = `rgba(255,255,255,${depth === 0 ? "0.08" : "0.06"})`;
                          el.style.background = "rgba(255,255,255,0.02)";
                          el.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.2)";
                          el.style.transform = "scale(1)";
                        }
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.transform = "scale(0.88)";
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transform = "scale(1.08)";
                      }}
                      aria-label={`${item.name} - দিন ${toBanglaNum(day)}`}
                    >
                      {checked && (
                        <svg
                          width={iconSize}
                          height={iconSize}
                          viewBox="0 0 24 24"
                          fill="none"
                          style={{
                            filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.2))",
                          }}
                        >
                          <path
                            d="M4 12.6L9.3 18L20 6"
                            stroke="white"
                            strokeWidth={depth === 0 ? 3.5 : 3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </td>
              );
            })}
          </tr>
        );
      })}
    </>
  );
}
