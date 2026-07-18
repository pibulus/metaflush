<script>
  // metaflush intro / onboarding — first-visit welcome + reopenable.
  // Built fresh to the shared SKELETON: native <dialog> with warm-dark blurred
  // backdrop (tap-to-close), pop-in OPEN + .modal-closing animate-out CLOSE
  // (setTimeout-before-close), 44px circular X (top-right 1rem, scale-hover,
  // focus ring), centred floating card at every breakpoint (motion in app.css).
  // prefers-reduced-motion = instant.
  // SKIN stays 100% metaflush: neobrutalist 4px black border + 6px hard shadow,
  // yellow #ffffa8 card / purple CTA, toiletroll mascot, "keeps your location
  // unseen" voice — EXIF / GPS / tracking-metadata copy untouched.
  import { createEventDispatcher } from "svelte";
  import ThemeMascot from "./ThemeMascot.svelte";
  import { theme } from "$lib";

  export let open = false;

  const dispatch = createEventDispatcher();
  let closing = false;

  function requestClose() {
    if (closing) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      dispatch("close");
      return;
    }
    closing = true;
    // Matches the 180ms close animation in app.css (.modal-closing).
    setTimeout(() => {
      closing = false;
      dispatch("close");
    }, 180);
  }

  function onKeydown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      requestClose();
    }
  }
</script>

<svelte:window on:keydown={open ? onKeydown : undefined} />

{#if open}
  <dialog class="modal" class:modal-closing={closing} open>
    <div
      class="modal-box intro-box"
      class:modal-closing={closing}
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-title"
    >
      <button
        type="button"
        class="x"
        on:click={requestClose}
        aria-label="Close intro"
      >
        <span aria-hidden="true">✕</span>
      </button>

      <div class="mascot-slot" aria-hidden="true">
        <ThemeMascot theme={$theme} size="92px" />
      </div>

      <h1 id="intro-title" class="title">
        metaflush's clean. <br /> keeps your location unseen.
      </h1>

      <div class="points">
        <p class="point">
          🎯 <strong>100% In-Browser</strong> — Your files are scrubbed right on your
          device. Zero bytes ever upload to our server.
        </p>
        <p class="point">
          ⚡ <strong>Lossless Clearing</strong> — Direct binary chunk slicing removes
          tags without re-encoding, preserving your pixels perfectly.
        </p>
        <p class="point">
          ✨ <strong>Clean Sharing</strong> — Easily strip GPS coordinates, camera
          models, serial numbers, Photoshop history, and device markers.
        </p>
      </div>

      <p class="tagline">No logs, no tracking, just pure clean pixels.</p>

      <button type="button" class="cta" on:click={requestClose}>
        let's clean
      </button>
    </div>

    <button
      type="button"
      class="modal-backdrop"
      on:click={requestClose}
      aria-label="Close intro"
      tabindex="-1"
    ></button>
  </dialog>
{/if}

<style>
  /* ── Frame: skin = neobrutalist yellow card (app.css gives the rest) ── */
  .intro-box {
    position: relative;
    width: min(92vw, 26rem);
    max-width: 26rem;
    background: #ffffa8;
    text-align: center;
  }

  /* Open/close motion + backdrop fade all live in app.css (shared DNA). */

  /* ── X button: 44px circular, top-right 1rem, scale-hover, focus ring ─ */
  .x {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    border: 2px solid #000;
    font-size: 1.15rem;
    font-weight: 900;
    line-height: 1;
    color: #000;
    background: #f87171;
    box-shadow: 2px 2px 0 0 #000;
    transition:
      transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1),
      background 0.15s ease;
  }
  .x:hover {
    background: #ef4444;
    transform: scale(1.08);
  }
  .x:active {
    transform: scale(0.92);
  }
  .x:focus-visible {
    outline: 2px solid var(--ds-primary-color, #10b981);
    outline-offset: 2px;
  }

  /* ── Mascot slot ─────────────────────────────────────────────────── */
  .mascot-slot {
    display: flex;
    justify-content: center;
    margin-bottom: 0.6rem;
    filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.18));
  }

  /* ── Copy ────────────────────────────────────────────────────────── */
  .title {
    font-size: 1.75rem;
    font-weight: 900;
    line-height: 1.15;
    letter-spacing: -0.02em;
    color: #000;
    margin-bottom: 1rem;
  }
  .points {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    text-align: left;
    margin-bottom: 0.75rem;
  }
  .point {
    font-size: 0.875rem;
    font-weight: 700;
    line-height: 1.5;
    color: #1f2937;
    background: rgba(255, 255, 255, 0.7);
    border: 2px solid #000;
    border-radius: 0.75rem;
    padding: 0.75rem;
  }
  .point strong {
    font-weight: 900;
  }
  .tagline {
    font-size: 1rem;
    font-weight: 800;
    color: #7e22ce;
    padding: 0.5rem 0;
    margin-bottom: 0.25rem;
    animation: intro-pulse 2s ease-in-out infinite;
  }

  .cta {
    width: 100%;
    border: 4px solid #000;
    border-radius: 0.75rem;
    padding: 0.75rem 1.1rem;
    font-size: 1.125rem;
    font-weight: 900;
    color: #000;
    background: #c084fc;
    box-shadow: 3px 3px 0 0 #000;
    transition:
      background 0.15s ease,
      transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .cta:hover {
    background: #a855f7;
    transform: translate(-1px, -1px);
  }
  .cta:active {
    transform: scale(0.97);
  }
  .cta:focus-visible {
    outline: 2px solid var(--ds-accent-color, #06b6d4);
    outline-offset: 2px;
  }

  /* Centered floating card at every breakpoint — no mobile bottom sheet. */

  /* ── Keyframes ───────────────────────────────────────────────────── */
  @keyframes intro-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.55;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .intro-box,
    .x,
    .cta,
    .tagline {
      animation: none !important;
      transition: none !important;
    }
  }
</style>
