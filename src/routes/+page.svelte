<script>
  import { onMount } from "svelte";
  import { Mascot } from "$lib/components/mascot";
  import ThemeMascot from "$lib/components/ThemeMascot.svelte";
  import PageLayout from "$lib/components/layout/PageLayout.svelte";
  import AnimatedTitle from "$lib/components/AnimatedTitle.svelte";
  import FooterComponent from "$lib/components/FooterComponent.svelte";
  import IntroModal from "$lib/components/IntroModal.svelte";
  import AboutModal from "$lib/components/AboutModal.svelte";
  import {
    flushMetadata,
    formatBytes,
    downloadBlob,
  } from "$lib/services/metadataService.js";
  import { theme, applyTheme } from "$lib";
  import { THEME_LIST } from "$lib/constants.js";

  let mascot;
  let dragOver = false;
  let busy = false;
  let busyLabel = "Flushing…";
  let error = "";
  /** @type {Array<{name,inputSize,outputSize,saved,ratio,blob,grew,note}>} */
  let results = [];

  // On ~800px desktop viewports the tall hero pushes fresh results (and their
  // Download buttons) below the fold with no cue. Reveal the first batch with
  // a minimal scroll (family pattern from talktype's waveform fix).
  let resultsEl;
  let resultsRevealTimer = null;
  $: if (results.length && resultsEl) scheduleResultsReveal();

  function scheduleResultsReveal() {
    if (resultsRevealTimer) return;
    resultsRevealTimer = setTimeout(() => {
      resultsRevealTimer = null;
      try {
        const reduceMotion = window.matchMedia?.(
          "(prefers-reduced-motion: reduce)",
        )?.matches;
        resultsEl?.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "nearest",
        });
      } catch {
        // Scrolling is a nicety — never let it break the flush flow.
      }
    }, 250);
  }

  // Modal states
  let showIntro = false;
  let showAbout = false;
  let showOptions = false;
  let strictMode = false; // Safe mode = false, Strict mode = true

  onMount(() => {
    const hasSeenIntro = localStorage.getItem("metaflush:seen_intro");
    if (!hasSeenIntro) {
      showIntro = true;
    }

    const savedStrict = localStorage.getItem("metaflush:strict_mode");
    if (savedStrict !== null) {
      strictMode = savedStrict === "true";
    }
  });

  function closeIntro() {
    showIntro = false;
    localStorage.setItem("metaflush:seen_intro", "true");
  }

  function closeAbout() {
    showAbout = false;
  }

  // Reopen path: from the About modal, replay the onboarding intro.
  function reopenIntro() {
    showAbout = false;
    showIntro = true;
  }

  function toggleStrict(val) {
    strictMode = val;
    localStorage.setItem("metaflush:strict_mode", String(val));
  }

  async function handleFiles(fileList) {
    const files = [...fileList];
    if (!files.length) return;
    error = "";
    busy = true;
    busyLabel = "Flushing…";
    mascot?.startThinking();

    try {
      // Pass strictMode option (strips color profiles if true)
      const out = await flushMetadata(files, strictMode);
      for (const r of out) {
        results = [r, ...results];
        mascot?.react(Math.round(Math.max(0, r.saved) / 1024) || 1);
      }
    } catch (e) {
      error = e.message;
    }

    busy = false;
    busyLabel = "Flushing…";
    mascot?.stopThinking();
  }

  function onDrop(e) {
    e.preventDefault();
    dragOver = false;
    handleFiles(e.dataTransfer.files);
  }

  function onPick(e) {
    handleFiles(e.target.files);
    e.target.value = "";
  }

  $: totalSaved = results.reduce((a, r) => a + Math.max(0, r.saved), 0);

  // Lock body scroll when modals are visible
  $: if (typeof document !== "undefined") {
    if (showIntro || showAbout || showOptions) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }
</script>

<svelte:head>
  <title>metaflush — strip metadata client-side</title>
</svelte:head>

<PageLayout>
  <div class="flex w-full flex-col items-center gap-8">
    <div class="h-44 w-44 sm:h-48 sm:w-48 md:h-56 md:w-56 lg:h-64 lg:w-64">
      <Mascot
        bind:this={mascot}
        character="toiletroll"
        eyes="shifty"
        accessory="none"
        theme={$theme}
        {busy}
        ariaLabel="metaflush — choose a file"
        on:activate={() => document.getElementById("file-input")?.click()}
      />
    </div>

    <AnimatedTitle title="metaflush" subtitle="Drop your files onto the mascot to wipe EXIF, GPS, and tracking metadata instantly. Done 100% locally." />

    <!-- Drop zone -->
    <label
      for="file-input"
      class="drop"
      class:drop-over={dragOver}
      class:drop-busy={busy}
      on:dragover|preventDefault={() => (dragOver = true)}
      on:dragleave={() => (dragOver = false)}
      on:drop={onDrop}
    >
      <input
        id="file-input"
        type="file"
        multiple
        class="sr-only"
        aria-label="Choose files to clean"
        on:change={onPick}
      />
      {#if busy}
        <span class="drop-text">{busyLabel}</span>
      {:else}
        <span class="drop-text">Drop files here</span>
        <span class="drop-sub">images (jpeg, png, webp) · zero server uploads</span>
      {/if}
    </label>

    {#if error}
      <p class="rounded-xl bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 border-2 border-amber-500">
        {error}
      </p>
    {/if}

    {#if results.length}
      <div class="w-full results-block" bind:this={resultsEl}>
        <p class="mb-2 text-center text-sm font-bold text-accent">
          Flushed {results.length} files (Wiped {formatBytes(totalSaved)} of metadata) 🎉
        </p>
        <ul class="flex flex-col gap-2">
          {#each results as r}
            <li class="result">
              <div class="min-w-0 flex-1">
                <p class="truncate font-bold">{r.name}</p>
                <p class="text-sm text-gray-500">
                  {formatBytes(r.inputSize)} → {formatBytes(r.outputSize)}
                  {#if r.saved > 0}
                    <span class="font-bold text-green-600">
                      −{formatBytes(r.saved)} metadata stripped
                    </span>
                  {:else}
                    <span class="text-gray-400">clean / no tags found</span>
                  {/if}
                </p>
              </div>
              <button class="dl" on:click={() => downloadBlob(r.blob, r.name)}>
                Download
              </button>
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    <!-- Theme switcher -->
    <div class="themes" role="group" aria-label="Theme">
      {#each THEME_LIST as t}
        <button
          class="theme-dot theme-{t.id}"
          class:on={$theme === t.id}
          title={t.label}
          aria-label={t.label}
          aria-pressed={$theme === t.id}
          on:click={() => applyTheme(t.id)}
        ></button>
      {/each}
    </div>
  </div>

  <svelte:fragment slot="footer-buttons">
    <FooterComponent 
      on:showAbout={() => (showAbout = true)} 
      on:showOptions={() => (showOptions = true)} 
    />
  </svelte:fragment>
</PageLayout>

<!-- ===================================================================
     MODALS SECTION
     =================================================================== -->

<!-- 1. INTRO ONBOARDING MODAL (skeleton component) -->
<IntroModal open={showIntro} on:close={closeIntro} />

<!-- 2. ABOUT MODAL (skeleton component) -->
<AboutModal
  open={showAbout}
  on:close={closeAbout}
  on:replayIntro={reopenIntro}
/>

<!-- 3. OPTIONS MODAL -->
{#if showOptions}
  <dialog class="modal" open>
    <div class="modal-box bg-[#ecfdf5] border-4 border-black shadow-[6px_6px_0px_0px_#000] relative">
      <button type="button" class="absolute top-4 right-4 h-9 w-9 border-2 border-black rounded-full bg-rose-300 font-black text-black hover:bg-rose-400 flex items-center justify-center" on:click={() => (showOptions = false)}>✕</button>
      
      <div class="space-y-4">
        <h3 class="pr-10 text-2xl font-black text-black">metaflush Options</h3>
        
        <div class="space-y-4 mt-2">
          <div class="flex flex-col gap-2 rounded-xl border-2 border-black bg-white p-4">
            <span class="text-xs font-black uppercase text-gray-500">Wiping Intensity</span>
            
            <label class="flex items-center gap-3 cursor-pointer mt-1">
              <input 
                type="radio" 
                name="strict" 
                checked={!strictMode} 
                on:change={() => toggleStrict(false)}
                class="w-5 h-5 text-emerald-600 accent-emerald-600 border-2 border-black" 
              />
              <div>
                <span class="font-black text-sm block">Safe Mode (Recommended)</span>
                <span class="text-xs font-semibold text-gray-500">Wipes GPS and EXIF details but keeps the ICC color profile to keep colors looking rich on all screens.</span>
              </div>
            </label>

            <div class="border-t border-gray-200 my-1"></div>

            <label class="flex items-center gap-3 cursor-pointer">
              <input 
                type="radio" 
                name="strict" 
                checked={strictMode} 
                on:change={() => toggleStrict(true)}
                class="w-5 h-5 text-emerald-600 accent-emerald-600 border-2 border-black" 
              />
              <div>
                <span class="font-black text-sm block text-amber-600">Strict Mode (Extreme Clean)</span>
                <span class="text-xs font-semibold text-gray-500">Wipes all metadata, comments, and color profiles. Results in the absolute smallest file size possible, but might subtly alter colors.</span>
              </div>
            </label>
          </div>

          <div class="flex flex-col gap-2 rounded-xl border-2 border-black bg-white p-4">
            <span class="text-xs font-black uppercase text-gray-500">Vibe</span>
            <div class="vibes" role="group" aria-label="Theme">
              {#each THEME_LIST as t}
                <button
                  type="button"
                  class="vibe"
                  class:on={$theme === t.id}
                  on:click={() => applyTheme(t.id)}
                  title={t.label}
                  aria-label="{t.label} vibe"
                  aria-pressed={$theme === t.id}
                >
                  <span class="vibe-art">
                    <ThemeMascot theme={t.id} size="38px" />
                  </span>
                  <span class="vibe-name">{t.label}</span>
                  {#if $theme === t.id}
                    <span class="vibe-check" aria-hidden="true">✓</span>
                  {/if}
                </button>
              {/each}
            </div>
          </div>
        </div>

        <button
          type="button"
          class="w-full mt-2 border-4 border-black bg-emerald-400 hover:bg-emerald-500 py-3 text-base font-black text-black rounded-xl shadow-[3px_3px_0px_0px_#000]"
          on:click={() => (showOptions = false)}
        >
          Save Options
        </button>
      </div>
    </div>
    <div class="modal-backdrop" on:click={() => (showOptions = false)}></div>
  </dialog>
{/if}

<style>
  .results-block {
    /* scrollIntoView respects this (unlike margin) — clears the fixed footer */
    scroll-margin-bottom: 7rem;
  }

  .drop {
    width: 100%;
    min-height: 168px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    cursor: pointer;
    border-radius: 24px;
    border: 4px dashed rgba(147, 51, 234, 0.4);
    background: rgba(255, 255, 255, 0.45);
    transition:
      border-color 0.2s ease,
      background 0.2s ease,
      transform 0.15s ease;
  }
  .drop:hover {
    border-color: rgba(147, 51, 234, 0.7);
  }
  .drop-over {
    border-color: #9333ea;
    background: rgba(244, 114, 182, 0.12);
    transform: scale(1.01);
  }
  .drop-busy {
    border-style: solid;
    border-color: #c026d3;
    background-image: linear-gradient(
      135deg,
      rgba(192, 38, 211, 0.08) 25%,
      transparent 25%,
      transparent 50%,
      rgba(192, 38, 211, 0.08) 50%,
      rgba(192, 38, 211, 0.08) 75%,
      transparent 75%,
      transparent
    );
    background-size: 40px 40px;
    animation: progress-stripes 1.2s linear infinite;
  }

  @keyframes progress-stripes {
    from { background-position: 40px 0; }
    to { background-position: 0 0; }
  }
  .drop-text {
    font-size: 1.25rem;
    font-weight: 800;
    color: #2a2233;
  }
  .drop-sub {
    font-size: 0.85rem;
    color: #8b8194;
  }

  .result {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border-radius: 16px;
    border: 2px solid rgba(0, 0, 0, 0.08);
    background: #fff;
    padding: 0.75rem 1rem;
  }
  .dl {
    flex-shrink: 0;
    border-radius: 999px;
    background: #9333ea;
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
    font-weight: 800;
    color: #fff;
    transition: background 0.15s ease;
  }
  .dl:hover {
    background: #7c3aed;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .themes {
    display: flex;
    gap: 0.6rem;
    margin-top: 0.5rem;
  }
  .theme-dot {
    width: 24px;
    height: 24px;
    border-radius: 999px;
    border: 3px solid rgba(0, 0, 0, 0.12);
    cursor: pointer;
    transition:
      transform 0.12s ease,
      border-color 0.12s ease;
  }
  .theme-dot:hover {
    transform: scale(1.12);
  }
  .theme-dot.on {
    border-color: rgba(0, 0, 0, 0.55);
    transform: scale(1.12);
  }
  .theme-clean {
    background: linear-gradient(135deg, #10b981, #06b6d4);
  }
  .theme-porcelain {
    background: linear-gradient(135deg, #0ea5e9, #a5f3fc);
  }
  .theme-kraft {
    background: linear-gradient(135deg, #854d0e, #166534);
  }
  .theme-lavender {
    background: linear-gradient(135deg, #6366f1, #a855f7);
  }

  /* ── Canonical "Vibe" mascot-swatch picker (Options modal) ── */
  .vibes {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
    margin-top: 0.25rem;
  }
  .vibe {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    padding: 0.55rem 0.25rem 0.45rem;
    border-radius: 14px;
    border: 2px solid rgba(0, 0, 0, 0.08);
    background: rgba(255, 255, 255, 0.55);
    cursor: pointer;
    transition:
      transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1),
      border-color 0.15s ease;
  }
  .vibe:hover {
    transform: translateY(-2px);
  }
  .vibe.on {
    border-color: var(--ds-primary-color, #10b981);
    box-shadow: 0 0 0 2px rgba(var(--ds-primary-color-rgb, 16, 185, 129), 0.35);
  }
  .vibe-art {
    line-height: 0;
    transition: transform 0.2s ease;
  }
  .vibe:hover .vibe-art {
    transform: scale(1.08);
  }
  .vibe-name {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--ds-ink, #2a2233);
  }
  .vibe-check {
    position: absolute;
    top: -6px;
    right: -6px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 999px;
    background: var(--ds-primary-color, #10b981);
    color: #fff;
    font-size: 0.65rem;
    font-weight: 800;
  }

  @media (prefers-reduced-motion: reduce) {
    .vibe,
    .vibe-art {
      transition: none;
    }
    .vibe:hover,
    .vibe:hover .vibe-art {
      transform: none;
    }
  }
</style>
