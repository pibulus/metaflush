<script>
  import { onMount } from "svelte";
  import { Mascot } from "$lib/components/mascot";
  import PageLayout from "$lib/components/layout/PageLayout.svelte";
  import AnimatedTitle from "$lib/components/AnimatedTitle.svelte";
  import FooterComponent from "$lib/components/FooterComponent.svelte";
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
  <div class="flex w-full flex-col items-center gap-5">
    <div class="mascot-slot">
      <Mascot
        bind:this={mascot}
        character="toiletroll"
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
      <p class="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 border-2 border-red-500">
        {error}
      </p>
    {/if}

    {#if results.length}
      <div class="w-full">
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

<!-- 1. INTRO ONBOARDING MODAL -->
{#if showIntro}
  <dialog class="modal" open>
    <div class="modal-box bg-[#ffffa8] border-4 border-black shadow-[6px_6px_0px_0px_#000] relative">
      <button type="button" class="absolute top-4 right-4 h-9 w-9 border-2 border-black rounded-full bg-red-400 font-black text-black hover:bg-red-500 flex items-center justify-center" on:click={closeIntro}>✕</button>
      
      <div class="space-y-4">
        <h1 class="text-3xl font-black leading-tight tracking-tight text-black text-center">
          metaflush's clean. <br /> keeps your location unseen.
        </h1>

        <div class="space-y-3 mt-4 text-sm font-bold text-gray-800">
          <p class="leading-relaxed bg-white/70 p-3 rounded-xl border-2 border-black">
            🎯 <strong>100% In-Browser</strong> — Your files are scrubbed right on your device. Zero bytes ever upload to our server.
          </p>
          <p class="leading-relaxed bg-white/70 p-3 rounded-xl border-2 border-black">
            ⚡ <strong>Lossless Clearing</strong> — Direct binary chunk slicing removes tags without re-encoding, preserving your pixels perfectly.
          </p>
          <p class="leading-relaxed bg-white/70 p-3 rounded-xl border-2 border-black">
            ✨ <strong>Clean Sharing</strong> — Easily strip GPS coordinates, camera models, serial numbers, Photoshop history, and device markers.
          </p>
        </div>

        <p class="py-2 text-center text-base font-extrabold text-purple-700 animate-pulse">
          No logs, no tracking, just pure clean pixels.
        </p>

        <button
          type="button"
          class="w-full border-4 border-black bg-purple-400 hover:bg-purple-500 py-3 text-lg font-black text-black rounded-xl shadow-[3px_3px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]"
          on:click={closeIntro}
        >
          let's clean
        </button>
      </div>
    </div>
    <div class="modal-backdrop" on:click={closeIntro}></div>
  </dialog>
{/if}

<!-- 2. ABOUT MODAL -->
{#if showAbout}
  <dialog class="modal" open>
    <div class="modal-box bg-[#fdf2f8] border-4 border-black shadow-[6px_6px_0px_0px_#000] relative">
      <button type="button" class="absolute top-4 right-4 h-9 w-9 border-2 border-black rounded-full bg-red-400 font-black text-black hover:bg-red-500 flex items-center justify-center" on:click={() => (showAbout = false)}>✕</button>
      
      <div class="space-y-4">
        <h3 class="text-2xl font-black text-black">About metaflush</h3>
        
        <div class="rounded-xl border-2 border-black bg-white p-4">
          <p class="text-sm font-medium leading-relaxed text-gray-700">
            metaflush is a minimalist, local-first utility designed to sweep tracking metadata from your media files before you share them. We believe your location, camera details, and digital history are yours to keep.
          </p>
        </div>

        <div class="space-y-2">
          <h4 class="text-sm font-black text-black">Why use this?</h4>
          <ul class="space-y-1.5 text-xs font-bold text-gray-700">
            <li class="flex items-center gap-2">
              <span class="text-purple-600">✦</span> Geotags can leak your precise home address.
            </li>
            <li class="flex items-center gap-2">
              <span class="text-purple-600">✦</span> Editor logs leak how, when, and who created the file.
            </li>
            <li class="flex items-center gap-2">
              <span class="text-purple-600">✦</span> Hidden metadata behaves like unique device fingerprints.
            </li>
          </ul>
        </div>

        <div class="border-l-4 border-purple-400 py-1 pl-4 italic text-sm font-extrabold text-gray-600">
          "A clean byte is a quiet byte."
        </div>

        <div class="flex items-end justify-between pt-2">
          <div>
            <p class="text-[10px] font-bold text-gray-500">Made with ☕ in Melbourne</p>
          </div>
          <div class="flex items-center gap-1.5 text-[10px] font-extrabold text-gray-600">
            <span>❤️</span>
            <a href="https://github.com/pibulus" target="_blank" rel="noopener noreferrer" class="hover:text-pink-600 underline">
              Pablo / Pibulus
            </a>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop" on:click={() => (showAbout = false)}></div>
  </dialog>
{/if}

<!-- 3. OPTIONS MODAL -->
{#if showOptions}
  <dialog class="modal" open>
    <div class="modal-box bg-[#ecfdf5] border-4 border-black shadow-[6px_6px_0px_0px_#000] relative">
      <button type="button" class="absolute top-4 right-4 h-9 w-9 border-2 border-black rounded-full bg-red-400 font-black text-black hover:bg-red-500 flex items-center justify-center" on:click={() => (showOptions = false)}>✕</button>
      
      <div class="space-y-4">
        <h3 class="text-2xl font-black text-black">metaflush Options</h3>
        
        <div class="space-y-4 mt-2">
          <div class="flex flex-col gap-2 rounded-xl border-2 border-black bg-white p-4">
            <span class="text-xs font-black uppercase text-gray-500">Wiping Intensity</span>
            
            <label class="flex items-center gap-3 cursor-pointer mt-1">
              <input 
                type="radio" 
                name="strict" 
                checked={!strictMode} 
                on:change={() => toggleStrict(false)}
                class="w-5 h-5 text-purple-600 accent-purple-600 border-2 border-black" 
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
                class="w-5 h-5 text-purple-600 accent-purple-600 border-2 border-black" 
              />
              <div>
                <span class="font-black text-sm block text-red-600">Strict Mode (Extreme Clean)</span>
                <span class="text-xs font-semibold text-gray-500">Wipes all metadata, comments, and color profiles. Results in the absolute smallest file size possible, but might subtly alter colors.</span>
              </div>
            </label>
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
  .mascot-slot {
    width: 168px;
    height: 168px;
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
  .theme-vibrant {
    background: linear-gradient(135deg, #9333ea, #f472b6);
  }
  .theme-warm {
    background: linear-gradient(135deg, #ff7a45, #ffd24c);
  }
  .theme-cool {
    background: linear-gradient(135deg, #0fb5c9, #5fe07a);
  }
  .theme-minimal {
    background: linear-gradient(135deg, #52525b, #a1a1aa);
  }
</style>
