<template>
  <div
    class="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950"
  >
    <UCard class="max-w-md w-full text-center p-4">
      <template #header>
        <h1 class="text-2xl font-bold dark:text-gray-100">
          Account Confirmed!
        </h1>
      </template>
      <p class="mt-4 dark:text-gray-400">
        Your account has been successfully activated. You can now log in and
        start using our features.
      </p>
      <UButton block to="/auth/login" color="primary" class="mt-6"
        >Go to Login</UButton
      >
    </UCard>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: "auth",
});
</script>
