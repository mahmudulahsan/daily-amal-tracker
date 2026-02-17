import { IbadahCategory, IbadahItem } from "./types";

export const RAMADAN_DAYS = 30;

export const defaultCategories: IbadahCategory[] = [
  { id: "obligatory-salat", name: "ফরজ সালাত", color: "emerald" },
  { id: "sunnah-salat", name: "সুন্নাত/নফল সালাত", color: "sky" },
  { id: "quran", name: "কুরআন", color: "rose" },
  { id: "duas", name: "দু'আ ও যিকর", color: "amber" },
  { id: "other", name: "অন্যান্য ইবাদাত", color: "teal" },
];

export const defaultItems: IbadahItem[] = [
  // ── ফরজ সালাত ──
  { id: "fajr", name: "ফজর", categoryId: "obligatory-salat" },

  { id: "dhuhr", name: "যোহর", categoryId: "obligatory-salat" },
  { id: "dhuhr-sunnah", name: "সুন্নাত সালাত আদায়", categoryId: "obligatory-salat", parentId: "dhuhr" },

  { id: "asr", name: "আসর", categoryId: "obligatory-salat" },

  { id: "maghrib", name: "মাগরিব", categoryId: "obligatory-salat" },
  { id: "maghrib-sunnah", name: "সুন্নাত সালাত আদায়", categoryId: "obligatory-salat", parentId: "maghrib" },

  { id: "isha", name: "ইশা", categoryId: "obligatory-salat" },
  { id: "isha-sunnah", name: "সুন্নাত সালাত আদায়", categoryId: "obligatory-salat", parentId: "isha" },

  // ── সুন্নাত/নফল সালাত ──
  { id: "duha", name: "চাশতের সালাত (দুহা)", categoryId: "sunnah-salat" },
  { id: "taraweeh", name: "তারাবীহ", categoryId: "sunnah-salat" },

  // ── কুরআন ──
  { id: "quran-reading", name: "দৈনিক কুরআন তিলাওয়াত", categoryId: "quran" },
  { id: "quran-tafsir", name: "তাফসীর / চিন্তা-ভাবনা", categoryId: "quran" },
  { id: "qiyamul-layl", name: "কিয়ামুল লাইল", categoryId: "quran" },

  // ── দু'আ ও যিকর ──
  { id: "morning-adhkar", name: "সকালের আযকার", categoryId: "duas" },
  { id: "evening-adhkar", name: "সন্ধ্যার আযকার", categoryId: "duas" },
  { id: "sleep-adhkar", name: "ঘুমানোর আগের আযকার", categoryId: "duas" },
  { id: "dua-iftar", name: "ইফতারের দু'আ", categoryId: "duas" },
  { id: "dua-suhoor", name: "সেহরির দু'আ", categoryId: "duas" },

  // ── অন্যান্য ইবাদাত ──
  { id: "sadaqah", name: "সদাকাহ (কমপক্ষে ৫ টাকা)", categoryId: "other" },
  { id: "istighfar", name: "ইস্তিগফার (১০০ বার)", categoryId: "other" },
  { id: "salawat", name: "নবী ﷺ এর উপর দরূদ", categoryId: "other" },
  { id: "no-backbiting", name: "গীবত থেকে বিরত/কম কথা বলা", categoryId: "other" },
  { id: "nazr-hifazat", name: "নজর হিফাজত", categoryId: "other" },
];
