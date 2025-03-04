<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 w-full">
    <div class="flex w-full relative mb-20">
      <TheSideBar :isOpen="isSidebarOpen" @close="closeSidebar"></TheSideBar>
      <div
        class="lg:ml-64 p-4 lg:px-8 w-full lg:w-[calc(100%-16rem)] fixed bg-gray-50 dark:bg-gray-950 z-20 h-20 flex items-center"
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
import UserMenu from "@/components/dashboard/UserMenu.vue";

const isSidebarOpen = ref(false);

const { userFirstName } = useUser();

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const closeSidebar = () => {
  if (window.innerWidth < 1024) {
    isSidebarOpen.value = false;
  }
};

onMounted(() => {
  isSidebarOpen.value = window.innerWidth >= 1024;
  window.addEventListener("resize", () => {
    isSidebarOpen.value = window.innerWidth >= 1024;
  });
});

onUnmounted(() => {
  window.removeEventListener("resize", () => {
    isSidebarOpen.value = window.innerWidth >= 1024;
  });
});
</script>
