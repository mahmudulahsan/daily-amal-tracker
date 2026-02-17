// ── Bangla numeral helper ──

const BANGLA_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

function toBanglaNum(n: number): string {
  return String(n)
    .split("")
    .map((d) => BANGLA_DIGITS[parseInt(d)] ?? d)
    .join("");
}

// ── English (Gregorian) date in Bangla ──

const ENGLISH_MONTHS_BN = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

const ENGLISH_WEEKDAYS_BN = [
  "রবিবার",
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
  "শনিবার",
];

export function getEnglishDateBn(date: Date): string {
  const day = toBanglaNum(date.getDate());
  const month = ENGLISH_MONTHS_BN[date.getMonth()];
  const year = toBanglaNum(date.getFullYear());
  const weekday = ENGLISH_WEEKDAYS_BN[date.getDay()];
  return `${weekday}, ${day} ${month} ${year}`;
}

// ── Hijri date ──

export function getHijriDateBn(date: Date): string {
  try {
    // Use Intl API with Islamic calendar
    const formatter = new Intl.DateTimeFormat("bn-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: undefined,
    });
    return formatter.format(date);
  } catch {
    // Fallback if Intl doesn't support islamic calendar
    return "";
  }
}

// ── Bengali (Bangla) calendar date ──

const BANGLA_MONTHS = [
  "বৈশাখ",
  "জ্যৈষ্ঠ",
  "আষাঢ়",
  "শ্রাবণ",
  "ভাদ্র",
  "আশ্বিন",
  "কার্তিক",
  "অগ্রহায়ণ",
  "পৌষ",
  "মাঘ",
  "ফাল্গুন",
  "চৈত্র",
];

// Revised Bengali Calendar (Bangladesh, since 1987)
// First 5 months: 31 days, last 7 months: 30 days
// 1 Boishakh = April 14 (fixed in revised calendar)
const BANGLA_MONTH_LENGTHS = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30, 30];

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function isGregorianLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getBanglaDateBn(date: Date): string {
  const gYear = date.getFullYear();
  const doy = dayOfYear(date);

  // April 14 = day 104 in leap year, 103 in non-leap year
  const leapYear = isGregorianLeapYear(gYear);
  const boishakhDoy = leapYear ? 105 : 104; // 1-indexed day of year for Apr 14

  let bYear: number;
  let daysSinceBoishakh: number;

  if (doy >= boishakhDoy) {
    // We're in the Bengali year that started this April
    bYear = gYear - 593;
    daysSinceBoishakh = doy - boishakhDoy;
  } else {
    // We're still in the Bengali year that started last April
    bYear = gYear - 594;
    const prevLeap = isGregorianLeapYear(gYear - 1);
    const daysInPrevYear = prevLeap ? 366 : 365;
    const prevBoishakhDoy = prevLeap ? 105 : 104;
    daysSinceBoishakh = daysInPrevYear - prevBoishakhDoy + doy;
  }

  // Find Bengali month and day
  let remaining = daysSinceBoishakh;
  let bMonth = 0;
  for (let i = 0; i < 12; i++) {
    if (remaining < BANGLA_MONTH_LENGTHS[i]) {
      bMonth = i;
      break;
    }
    remaining -= BANGLA_MONTH_LENGTHS[i];
  }

  const bDay = remaining + 1;

  return `${toBanglaNum(bDay)} ${BANGLA_MONTHS[bMonth]} ${toBanglaNum(bYear)}`;
}

// ── Combined export ──

export interface AllDates {
  english: string;
  hijri: string;
  bangla: string;
}

export function getCurrentDates(): AllDates {
  const now = new Date();
  return {
    english: getEnglishDateBn(now),
    hijri: getHijriDateBn(now),
    bangla: getBanglaDateBn(now),
  };
}
