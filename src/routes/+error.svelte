<script>
  import { page } from "$app/stores";
  import PageLayout from "$lib/components/layout/PageLayout.svelte";
  import { DisplayMascot } from "$lib/components/mascot";
  import { theme } from "$lib";

  $: status = $page.status;
  $: message =
    status === 404
      ? "This page got flushed. There's nothing here."
      : ($page.error?.message ?? "Something clogged up.");
</script>

<PageLayout title="metaflush — page not found">
  <div class="flex w-full flex-col items-center gap-6 text-center">
    <div class="h-40 w-40 sm:h-44 sm:w-44">
      <DisplayMascot character="toiletroll" theme={$theme} size="100%" />
    </div>

    <div class="space-y-2">
      <h1 class="text-3xl font-black text-gray-800">{status}</h1>
      <p class="text-sm font-semibold text-gray-500">{message}</p>
    </div>

    <a
      href="/"
      class="rounded-xl border-2 border-black bg-white px-5 py-2 text-sm font-black text-black shadow-[3px_3px_0px_0px_#000] transition-transform hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000]"
    >
      Back to metaflush
    </a>
  </div>
</PageLayout>
