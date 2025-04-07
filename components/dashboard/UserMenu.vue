<template>
  <div class="dark:text-gray-900 z-20">
    <div class="flex justify-between items-center">
      <UDropdown :items="items" :popper="{ placement: 'bottom-start' }">
        <UButton color="white" variant="outline">
          <UAvatar
            :ui="{
              background: 'bg-gray-500',
              placeholder: 'text-white',
            }"
            :alt="userInitials"
            size="sm"
          ></UAvatar>
        </UButton>
      </UDropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
const toast = useToast();
const client = useSupabaseClient();
const { userInitials } = useUser();
/**
 * @component UserMenu
 * @description User account dropdown menu component
 * Features:
 * - User avatar display
 * - Quick access to profile and logout
 * - Integration with auth system
 */

/**
 * Dropdown menu configuration
 * @type {Array<Array<{label: string, icon: string, to?: string, click?: Function}>>}
 */
const items = [
  [
    {
      label: "Profile",
      icon: "i-heroicons-user-circle-20-solid",
      to: "/dashboard/profile",
    },
    {
      label: "Logout",
      icon: "i-heroicons-arrow-right-circle-20-solid",
      click: () => logout(),
    },
  ],
];

/**
 * Handles user logout process
 * Includes success/error notifications
 * @async
 * @function
 */
const logout = async () => {
  const { error } = await client.auth.signOut();
  if (error) {
    return toast.add({
      title: "Error while logging out",
      icon: "i-heroicons-check-badge-solid",
      color: "red",
    });
  }
  toast.add({
    title: "Log out Successful!",
    icon: "i-heroicons-check-badge-solid",
  });
  await navigateTo("/auth/login");
};
</script>
