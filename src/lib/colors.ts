export type ColorName =
  | "emerald"
  | "sky"
  | "violet"
  | "amber"
  | "rose"
  | "teal"
  | "indigo"
  | "orange"
  | "cyan"
  | "pink"
  | "lime"
  | "fuchsia";

export const availableColors: ColorName[] = [
  "emerald",
  "sky",
  "violet",
  "amber",
  "rose",
  "teal",
  "indigo",
  "orange",
  "cyan",
  "pink",
  "lime",
  "fuchsia",
];

export interface ColorValues {
  main: string;
  light: string;
  text: string;
  dark: string;
  vivid: string;
}

export const COLORS: Record<ColorName, ColorValues> = {
  emerald: {
    main: "#10b981",
    light: "rgba(16,185,129,0.13)",
    text: "#6ee7b7",
    dark: "#064e3b",
    vivid: "#34d399",
  },
  sky: {
    main: "#0ea5e9",
    light: "rgba(14,165,233,0.13)",
    text: "#7dd3fc",
    dark: "#0c4a6e",
    vivid: "#38bdf8",
  },
  violet: {
    main: "#8b5cf6",
    light: "rgba(139,92,246,0.13)",
    text: "#c4b5fd",
    dark: "#4c1d95",
    vivid: "#a78bfa",
  },
  amber: {
    main: "#f59e0b",
    light: "rgba(245,158,11,0.13)",
    text: "#fcd34d",
    dark: "#78350f",
    vivid: "#fbbf24",
  },
  rose: {
    main: "#f43f5e",
    light: "rgba(244,63,94,0.13)",
    text: "#fda4af",
    dark: "#881337",
    vivid: "#fb7185",
  },
  teal: {
    main: "#14b8a6",
    light: "rgba(20,184,166,0.13)",
    text: "#5eead4",
    dark: "#134e4a",
    vivid: "#2dd4bf",
  },
  indigo: {
    main: "#6366f1",
    light: "rgba(99,102,241,0.13)",
    text: "#a5b4fc",
    dark: "#312e81",
    vivid: "#818cf8",
  },
  orange: {
    main: "#f97316",
    light: "rgba(249,115,22,0.13)",
    text: "#fdba74",
    dark: "#7c2d12",
    vivid: "#fb923c",
  },
  cyan: {
    main: "#06b6d4",
    light: "rgba(6,182,212,0.13)",
    text: "#67e8f9",
    dark: "#164e63",
    vivid: "#22d3ee",
  },
  pink: {
    main: "#ec4899",
    light: "rgba(236,72,153,0.13)",
    text: "#f9a8d4",
    dark: "#831843",
    vivid: "#f472b6",
  },
  lime: {
    main: "#84cc16",
    light: "rgba(132,204,22,0.13)",
    text: "#bef264",
    dark: "#365314",
    vivid: "#a3e635",
  },
  fuchsia: {
    main: "#d946ef",
    light: "rgba(217,70,239,0.13)",
    text: "#f0abfc",
    dark: "#701a75",
    vivid: "#e879f9",
  },
};

export function getColor(color: string): ColorValues {
  return COLORS[color as ColorName] || COLORS.emerald;
}
