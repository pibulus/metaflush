<script>
  // metaflush about — reopenable "what is this" panel.
  // Built fresh to the shared SKELETON, mirroring IntroModal exactly: native
  // <dialog> with the app.css warm-dark blurred backdrop (tap-to-close), pop-in
  // OPEN + .modal-closing animate-out CLOSE (setTimeout-before-close), 44px
  // circular X (top-right 1rem, scale-hover, focus ring), centred card above
  // 640px → docked bottom-sheet below it. prefers-reduced-motion = instant.
  // Full link set: toiletroll mascot icon + bare github.com/pibulus +
  // ko-fi.com/madebypablo + local-first privacy one-liner.
  // SKIN stays 100% metaflush: neobrutalist 4px black border + 6px hard shadow,
  // pink #fdf2f8 card / purple accents, "a clean byte is a quiet byte" voice —
  // EXIF / GPS / fingerprint copy untouched.
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
    setTimeout(() => {
      closing = false;
      dispatch("close");
    }, 220);
  }

  function replayIntro() {
    if (closing) return;
    dispatch("replayIntro");
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
      class="modal-box about-box"
      class:modal-closing={closing}
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-title"
    >
      <button
        type="button"
        class="x"
        on:click={requestClose}
        aria-label="Close about"
      >
        <span aria-hidden="true">✕</span>
      </button>

      <div class="mascot-slot" aria-hidden="true">
        <ThemeMascot theme={$theme} size="84px" />
      </div>

      <h3 id="about-title" class="title">About metaflush</h3>

      <div class="blurb">
        <p>
          metaflush is a minimalist, local-first utility designed to sweep
          tracking metadata from your media files before you share them. We
          believe your location, camera details, and digital history are yours
          to keep.
        </p>
      </div>

      <div class="reasons">
        <h4 class="reasons-head">Why use this?</h4>
        <ul>
          <li><span class="bullet">✦</span> Geotags can leak your precise home address.</li>
          <li><span class="bullet">✦</span> Editor logs leak how, when, and who created the file.</li>
          <li><span class="bullet">✦</span> Hidden metadata behaves like unique device fingerprints.</li>
        </ul>
      </div>

      <p class="quote">"A clean byte is a quiet byte."</p>

      <button type="button" class="replay" on:click={replayIntro}>
        Replay intro
      </button>

      <!-- ── Full link set: mascot · GitHub · Ko-fi · privacy ── -->
      <div class="links">
        <a
          class="link link-mascot"
          href="https://github.com/pibulus"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Pablo on GitHub"
        >
          <ThemeMascot theme={$theme} size="28px" />
        </a>
        <a
          class="link"
          href="https://github.com/pibulus"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <a
          class="link link-kofi"
          href="https://ko-fi.com/madebypablo"
          target="_blank"
          rel="noopener noreferrer"
        >
          ☕ Ko-fi
        </a>
      </div>

      <p class="privacy">
        🔒 100% local — files never leave your device. No logs, no tracking.
      </p>
      <p class="madeby">Made with ☕ in Melbourne · Pablo</p>
    </div>

    <button
      type="button"
      class="modal-backdrop"
      on:click={requestClose}
      aria-label="Close about"
      tabindex="-1"
    ></button>
  </dialog>
{/if}

<style>
  /* ── Frame: skin = metaflush pink neobrutalist card (app.css gives base) ── */
  .about-box {
    position: relative;
    width: min(92vw, 26rem);
    max-width: 26rem;
    background: #fdf2f8;
    text-align: center;
  }

  /* ── CLOSE animation (#1 win): hold .modal-closing before unmount ───── */
  .modal.modal-closing > .modal-backdrop {
    animation: about-backdrop-out 0.22s ease-in forwards;
  }
  :global(dialog.modal[open]) > .modal-box.modal-closing {
    animation: about-pop-out 0.22s cubic-bezier(0.4, 0, 1, 0.6) forwards;
  }

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
    outline: 2px solid var(--ds-primary-color, #a855f7);
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
    font-size: 1.65rem;
    font-weight: 900;
    line-height: 1.15;
    letter-spacing: -0.02em;
    color: #000;
    margin-bottom: 0.85rem;
  }
  .blurb {
    margin-bottom: 0.85rem;
  }
  .blurb p {
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 1.55;
    color: #374151;
    background: #fff;
    border: 2px solid #000;
    border-radius: 0.75rem;
    padding: 0.85rem;
    text-align: left;
  }
  .reasons {
    text-align: left;
    margin-bottom: 0.85rem;
  }
  .reasons-head {
    font-size: 0.875rem;
    font-weight: 900;
    color: #000;
    margin-bottom: 0.4rem;
  }
  .reasons ul {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .reasons li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.78rem;
    font-weight: 700;
    color: #374151;
  }
  .bullet {
    color: #9333ea;
  }
  .quote {
    font-size: 0.95rem;
    font-style: italic;
    font-weight: 800;
    color: #6b7280;
    border-left: 4px solid #c084fc;
    padding: 0.15rem 0 0.15rem 1rem;
    margin-bottom: 0.85rem;
    text-align: left;
  }

  .replay {
    width: 100%;
    border: 4px solid #000;
    border-radius: 0.75rem;
    padding: 0.7rem 1.1rem;
    font-size: 1rem;
    font-weight: 900;
    color: #000;
    background: #c084fc;
    box-shadow: 3px 3px 0 0 #000;
    margin-bottom: 1rem;
    transition:
      background 0.15s ease,
      transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .replay:hover {
    background: #a855f7;
    transform: translate(-1px, -1px);
  }
  .replay:active {
    transform: scale(0.97);
  }
  .replay:focus-visible {
    outline: 2px solid var(--ds-accent-color, #c026d3);
    outline-offset: 2px;
  }

  /* ── Link set (44px tap targets) ─────────────────────────────────── */
  .links {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 0.6rem;
  }
  .link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    min-height: 44px;
    min-width: 44px;
    padding: 0 0.75rem;
    border: 2px solid #000;
    border-radius: 999px;
    background: #fff;
    font-size: 0.8rem;
    font-weight: 800;
    color: #000;
    text-decoration: none;
    transition:
      transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1),
      background 0.15s ease;
  }
  .link:hover {
    transform: translateY(-2px);
    background: #f3e8ff;
  }
  .link:focus-visible {
    outline: 2px solid var(--ds-primary-color, #a855f7);
    outline-offset: 2px;
  }
  .link-mascot {
    padding: 0 0.5rem;
  }
  .link-kofi:hover {
    background: #fce7f3;
  }

  .privacy {
    font-size: 0.72rem;
    font-weight: 700;
    color: #6b7280;
    margin-bottom: 0.3rem;
  }
  .madeby {
    font-size: 0.68rem;
    font-weight: 700;
    color: #9ca3af;
  }

  /* ── Mobile bottom-sheet below 640px ─────────────────────────────── */
  @media (max-width: 639px) {
    .about-box {
      width: 100%;
      max-width: 100%;
      max-height: 92dvh;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      padding-bottom: calc(
        clamp(1.25rem, 3vw, 2rem) + env(safe-area-inset-bottom, 0px)
      );
      animation: about-sheet-in 0.34s
        linear(0, 0.4 7%, 1.05 18%, 1.12 24%, 0.97 47%, 1.005 70%, 1) both;
    }
    :global(dialog.modal[open]) {
      place-items: end center;
      padding: 0;
    }
    :global(dialog.modal[open]) > .modal-box.modal-closing {
      animation: about-sheet-out 0.22s cubic-bezier(0.4, 0, 1, 0.6) forwards;
    }
  }

  /* ── Keyframes ───────────────────────────────────────────────────── */
  @keyframes about-backdrop-out {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
  @keyframes about-pop-out {
    from {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
    to {
      opacity: 0;
      transform: scale(0.94) translateY(8px);
    }
  }
  @keyframes about-sheet-in {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
  @keyframes about-sheet-out {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(100%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .about-box,
    .x,
    .replay,
    .link,
    :global(dialog.modal[open]) > .modal-box.modal-closing,
    .modal.modal-closing > .modal-backdrop {
      animation: none !important;
      transition: none !important;
    }
  }
</style>
