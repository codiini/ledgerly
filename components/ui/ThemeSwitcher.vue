<script setup lang="ts">
/**
 * @component ThemeSwitcher
 * @description Theme toggle component with popover interface
 * Supports light and dark mode switching with persistent state
 */

/**
 * Theme configuration options
 * @type {Array<{name: string, icon: string, label: string}>}
 */
const colorMode = useColorMode();

const themes = [
  {
    name: "light",
    icon: "i-heroicons-sun",
    label: "Light",
  },
  {
    name: "dark",
    icon: "i-heroicons-moon",
    label: "Dark",
  },
];

/**
 * Updates color mode preference
 * @function
 * @param {string} theme - Theme name to activate
 */
const selectTheme = (theme: string) => {
  colorMode.preference = theme;
};

const isDarkTheme = computed(() => {
  return ["dark", "black"].includes(colorMode.value);
});
</script>

<template>
  <ClientOnly>
    <UPopover :popper="{ placement: 'top' }">
      <UButton
        color="gray"
        variant="ghost"
        class="w-full flex justify-between items-center p-4"
      >
        <div class="flex items-center gap-2">
          <UIcon
            :name="
              themes.find((t) => t.name === colorMode.value)?.icon ||
              themes[0].icon
            "
            class="w-5 h-5"
            :class="isDarkTheme ? 'text-white' : 'text-gray-800'"
          />
          <span
            class="capitalize"
            :class="isDarkTheme ? 'text-white' : 'text-gray-800'"
          >
            {{ colorMode.value }} Mode
          </span>
        </div>
        <UIcon
          name="i-heroicons-chevron-up"
          class="w-5 h-5"
          :class="isDarkTheme ? 'text-white' : 'text-gray-800'"
        />
      </UButton>

      <template #panel>
        <div class="p-2 flex gap-2 min-w-full">
          <UButton
            v-for="theme in themes"
            :key="theme.name"
            :color="colorMode.value === theme.name ? 'primary' : 'white'"
            variant="soft"
            class="flex-1 h-16 gap-1"
            @click="selectTheme(theme.name)"
          >
            <UIcon :name="theme.icon" class="w-5 h-5" />
            <span class="text-sm">{{ theme.label }}</span>
          </UButton>
        </div>
      </template>
    </UPopover>
  </ClientOnly>
</template>
