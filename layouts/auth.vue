<template>
  <div
    class="bg-gray-50 dark:bg-gray-950 min-h-screen flex items-center justify-center"
  >
    <div class="w-full max-w-md p-4">
      <div
        class="h-20 w-full flex items-center justify-center text-black dark:text-white font-black text-2xl"
      >
        <img
          class="block dark:hidden"
          src="@/assets/logo-dark.svg"
          alt="Ledgerly logo"
        />
        <img
          class="hidden dark:block"
          src="@/assets/logo-light.svg"
          alt="Ledgerly logo"
        />
      </div>
      <slot />
    </div>
  </div>
</template>
