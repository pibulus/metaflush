<!--
  ThemeMascot — a tiny toiletroll in a given theme's gradient, for the vibe
  picker tiles. Uses the real mascot silhouette + that theme's palette.
-->
<script>
  import artUrl from "$lib/components/mascot/art/toiletroll.svg?url";
  import { metaflushThemes } from "$lib/mascotThemes.js";

  export let theme = "clean";
  export let size = "40px";

  const uid = Math.random().toString(36).slice(2, 8);
  $: pal = metaflushThemes[theme] || metaflushThemes.clean;
  $: gid = `tm-${theme}-${uid}`;
</script>

<svg
  viewBox="0 0 1024 1024"
  width={size}
  height={size}
  class="theme-mascot"
  aria-hidden="true"
  focusable="false"
>
  <defs>
    <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color={pal.start} />
      <stop offset="50%" stop-color={pal.mid2} />
      <stop offset="100%" stop-color={pal.end} />
    </linearGradient>
  </defs>
  <use href={artUrl + "#mascot-background"} fill="url(#{gid})" />
  <use href={artUrl + "#mascot-body-path"} fill="#000000" />
  <use href={artUrl + "#mascot-eye-left-path"} fill="#000000" />
  <use href={artUrl + "#mascot-eye-right-path"} fill="#000000" />
</svg>

<style>
  .theme-mascot {
    display: block;
    overflow: visible;
  }
</style>
