<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 w-full">
    <div class="flex w-full relative mb-20">
      <TheSideBar :isOpen="isSidebarOpen" @close="closeSidebar"></TheSideBar>
      <div
        class="lg:ml-64 p-4 lg:px-8 w-full lg:w-[calc(100%-16rem)] fixed top-0 bg-gray-50 dark:bg-gray-950 z-20 h-20 flex items-center"
      >
        <UButton
          @click="toggleSidebar"
          :icon="isSidebarOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'"
          variant="ghost"
          size="md"
          class="text-black lg:hidden z-[55] transition-all duration-300"
          :class="isSidebarOpen ? 'translate-x-64' : 'translate-x-0'"
        />

        <div
          class="text-lg lg:text-3xl dark:text-white text-gray-900 font-semibold"
        >
          Hello {{ userFirstName }}!
        </div>
        <UserMenu class="ml-auto" />
      </div>
    </div>
    <slot />
  </div>
</template>

<script setup>
/**
 * @component DefaultLayout
 * @description Main layout component with responsive sidebar and header
 * Manages sidebar state and provides basic layout structure for the application
 */

import UserMenu from "@/components/dashboard/UserMenu.vue";

/**
 * Reactive reference for sidebar visibility state
 * @type {Ref<boolean>}
 */
const isSidebarOpen = ref(false);

/**
 * Destructured user's first name from useUser composable
 * @type {ComputedRef<string>}
 */
const { userFirstName } = useUser();

/**
 * Toggles the sidebar open/closed state
 * @function
 */
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

/**
 * Closes the sidebar on mobile devices (width < 1024px)
 * @function
 */
const closeSidebar = () => {
  if (window.innerWidth < 1024) {
    isSidebarOpen.value = false;
  }
};

/**
 * Lifecycle hook to initialize sidebar state and add resize listener
 * Sets sidebar open by default on desktop (≥1024px) and closed on mobile
 */
onMounted(() => {
  isSidebarOpen.value = window.innerWidth >= 1024;
  window.addEventListener("resize", () => {
    isSidebarOpen.value = window.innerWidth >= 1024;
  });
});

/**
 * Lifecycle hook to clean up resize event listener
 */
onUnmounted(() => {
  window.removeEventListener("resize", () => {
    isSidebarOpen.value = window.innerWidth >= 1024;
  });
});
</script>
