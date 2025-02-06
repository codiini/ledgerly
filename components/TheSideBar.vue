<template>
  <aside
    class="fixed flex flex-col w-64 shadow-lg lg:mr-64 pt-10 h-full px-2 bg-gray-50 dark:bg-gray-700 z-50"
    :class="{
      'fixed w-64 shadow-lg z-40 transition-transform duration-300 ease-in-out transform': true,
      '-translate-x-full lg:translate-x-0': !isOpen,
      'translate-x-0': isOpen,
    }"
  >
    <UVerticalNavigation
      @click="emit('close')"
      :ui="{
        active: 'border-current font-medium',
        inactive: 'text-black dark:text-white',
        size: 'text-md',
        base: 'my-4 py-3',
      }"
      :links="links"
    >
      <template #default="{ link }">
        <span class="relative">{{ link.label }}</span>
      </template>
    </UVerticalNavigation>

    <div class="mt-auto py-4">
      <ThemeSwticher />
    </div>
  </aside>
</template>

<script lang="ts" setup>
import ThemeSwticher from "./ui/ThemeSwitcher.vue";

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const links = [
  {
    label: "Home",
    icon: "i-heroicons-home",
    to: "/dashboard",
  },
  {
    label: "Transactions",
    icon: "i-heroicons-banknotes-solid",
    to: "/dashboard/transactions",
  },
  {
    label: "Customers",
    icon: "i-heroicons-user-solid",
    to: "/dashboard/customers",
  },
  {
    label: "Inventory",
    icon: "i-heroicons-shopping-bag-solid",
    to: "/dashboard/inventory",
  },
];
</script>
08080527411
