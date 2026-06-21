<script>
  export let title = "metaflush — strip metadata client-side";
  export let description =
    "Strip EXIF, GPS, and tracking metadata from your files — 100% in your browser.";
  export let footerYear = new Date().getFullYear();
  export let appName = "metaflush";
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
</svelte:head>

<a class="skip-link" href="#main-content">Skip to content</a>

<div
  class="bg-gradient-mesh page-shell grid min-h-[100dvh] gap-8 px-4 py-6 pt-[clamp(4rem,12vh,8rem)] font-sans text-gray-800 antialiased sm:px-6 md:px-10"
>
  <main
    id="main-content"
    class="mx-auto flex w-full max-w-md flex-col items-center sm:max-w-lg md:max-w-2xl lg:max-w-3xl"
  >
    <slot />
  </main>

  <footer
    class="ds-app-footer fixed bottom-0 left-0 right-0 z-10 box-border border-t pb-2 pt-3 text-center text-xs backdrop-blur-[3px] sm:pb-4 sm:pt-5"
  >
    <div
      class="container mx-auto flex flex-row items-center justify-center gap-1 sm:justify-between sm:gap-3"
    >
      <div class="ml-4 hidden flex-wrap items-center sm:ml-6 sm:flex">
        <span class="mr-1 text-sm font-medium">
          © {footerYear} {appName}
        </span>
        <span class="footer-dot mx-2">•</span>
        <span class="text-sm font-light">
          <span
            class="footer-heart inline-block animate-pulse transition-transform hover:scale-110"
            aria-label="love">❤️</span
          > in Melbourne
        </span>
      </div>
      <div class="flex items-center sm:mr-6">
        <slot name="footer-buttons" />
      </div>
    </div>
  </footer>
</div>

<style>
  .page-shell {
    /* reserve room for the fixed footer (matches ZipList's tuned values) */
    padding-bottom: calc(5rem + env(safe-area-inset-bottom));
  }

  .bg-gradient-mesh {
    background-color: var(--ds-bg, #f3e8ff);
    background-image:
      radial-gradient(circle at 20% 10%, var(--ds-bg-2, #fce7f3), transparent 55%),
      radial-gradient(circle at 80% 90%, var(--ds-bg-2, #fce7f3), transparent 55%);
  }

  .ds-app-footer {
    color: var(--footer-text-color, #4b5563);
    background: var(
      --footer-bg,
      rgba(var(--ds-footer-surface-rgb, 255, 255, 255), 0.75)
    );
    border-color: var(
      --footer-border-color,
      rgba(var(--ds-primary-color-rgb, 147, 51, 234), 0.14)
    );
    padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
  }

  .footer-dot {
    color: var(--footer-dot-color, var(--ds-accent-color, #c026d3));
  }

  .footer-heart {
    color: var(--footer-heart-color, #ef4444);
  }

  @media (prefers-reduced-motion: reduce) {
    .footer-heart {
      animation: none;
    }
  }

  .skip-link {
    position: absolute;
    left: -9999px;
    top: 0;
    z-index: 50;
    padding: 0.5rem 1rem;
    background: #fff;
    border-radius: 0 0 0.5rem 0;
  }
  .skip-link:focus {
    left: 0;
  }
</style>
