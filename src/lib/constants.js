// metaflush constants

export const THEMES = {
  CLEAN: "clean",         // default, fresh mint/emerald
  PORCELAIN: "porcelain", // crisp water blue/cyan
  KRAFT: "kraft",         // organic beige/green (crepe/recycled paper)
  LAVENDER: "lavender",   // sanitizing ultraviolet/lavender
};

export const THEME_LIST = [
  { id: THEMES.CLEAN, label: "Clean" },
  { id: THEMES.PORCELAIN, label: "Porcelain" },
  { id: THEMES.KRAFT, label: "Kraft" },
  { id: THEMES.LAVENDER, label: "Lavender" },
];

export const DEFAULT_THEME = THEMES.CLEAN;

export const STORAGE_KEYS = {
  THEME: "metaflush-theme",
};
