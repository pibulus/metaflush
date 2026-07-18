<script>
  import "../app.css";
  import "$lib/styles/theme-variables.css";
  import { onMount } from "svelte";
  import {
    GradientDefs,
    defineMascotThemes,
    ensureMascotThemeStyles,
    setTheme as setMascotTheme,
  } from "$lib/components/mascot";
  import { metaflushThemes } from "$lib/mascotThemes.js";
  import { theme, applyTheme } from "$lib";
  import PwaInstallCard from "$lib/components/PwaInstallCard.svelte";
  import { DEFAULT_THEME } from "$lib/constants.js";

  // Register metaflush's mascot palettes (keyed to the app theme names).
  defineMascotThemes(metaflushThemes, { fallback: DEFAULT_THEME });

  // Keep the mascot's color in sync with the app theme.
  $: setMascotTheme($theme);

  onMount(() => {
    ensureMascotThemeStyles();
    // Reflect the stored/default theme onto <html> + persist.
    applyTheme($theme);
  });
</script>

<svg width="0" height="0" style="position: absolute" aria-hidden="true">
  <defs>
    <GradientDefs />
  </defs>
</svg>

<slot />

<PwaInstallCard
  appName="metaflush"
  tagline="A clean byte is a quiet byte."
  iconSrc="/icon-192.png"
  storagePrefix="metaflush"
/>
