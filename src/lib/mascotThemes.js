// metaflush mascot palettes — keyed to match the app themes (constants THEMES),
// so the mascot recolors when the theme switches.

export const metaflushThemes = {
  clean: {
    // Punchy "clean water" gradient: lavender → indigo → mint → aqua (matches the new mascot art).
    start: "#c4b5fd", startBright: "#a78bfa",
    mid1: "#a5b4fc", mid1Bright: "#818cf8",
    mid2: "#6ee7b7", mid2Bright: "#34d399",
    mid3: "#5eead4", mid3Bright: "#2dd4bf",
    end: "#5eead4", endBright: "#22d3ee",
    glowPrimary: "rgba(165,180,252,1)", glowSecondary: "rgba(110,231,183,0.9)", glowTertiary: "rgba(94,234,212,0.8)",
    shadowColor: "rgba(165,180,252,0.35)", shadowColorBright: "rgba(110,231,183,0.45)", shadowColorBrightest: "rgba(94,234,212,0.5)",
  },
  porcelain: {
    // Crisp water: sky blue → cyan → teal.
    start: "#7dd3fc", startBright: "#38bdf8",
    mid1: "#38bdf8", mid1Bright: "#0ea5e9",
    mid2: "#22d3ee", mid2Bright: "#06b6d4",
    mid3: "#5eead4", mid3Bright: "#2dd4bf",
    end: "#2dd4bf", endBright: "#14b8a6",
    glowPrimary: "rgba(56,189,248,1)", glowSecondary: "rgba(34,211,238,0.9)", glowTertiary: "rgba(94,234,212,0.8)",
    shadowColor: "rgba(56,189,248,0.35)", shadowColorBright: "rgba(34,211,238,0.45)", shadowColorBrightest: "rgba(94,234,212,0.5)",
  },
  kraft: {
    // Recycled paper: warm sand → chartreuse → lime green.
    start: "#e3c8a3", startBright: "#d4a574",
    mid1: "#d9f99d", mid1Bright: "#bef264",
    mid2: "#bef264", mid2Bright: "#a3e635",
    mid3: "#86efac", mid3Bright: "#4ade80",
    end: "#4ade80", endBright: "#22c55e",
    glowPrimary: "rgba(190,242,100,1)", glowSecondary: "rgba(134,239,172,0.9)", glowTertiary: "rgba(74,222,128,0.8)",
    shadowColor: "rgba(190,242,100,0.35)", shadowColorBright: "rgba(134,239,172,0.45)", shadowColorBrightest: "rgba(74,222,128,0.5)",
  },
  lavender: {
    // Sanitizing UV: violet → magenta → pink.
    start: "#c084fc", startBright: "#a855f7",
    mid1: "#d8b4fe", mid1Bright: "#c084fc",
    mid2: "#f472b6", mid2Bright: "#ec4899",
    mid3: "#f9a8d4", mid3Bright: "#f472b6",
    end: "#f9a8d4", endBright: "#ec4899",
    glowPrimary: "rgba(192,132,252,1)", glowSecondary: "rgba(244,114,182,0.9)", glowTertiary: "rgba(249,168,212,0.8)",
    shadowColor: "rgba(192,132,252,0.35)", shadowColorBright: "rgba(244,114,182,0.45)", shadowColorBrightest: "rgba(249,168,212,0.5)",
  },
};
