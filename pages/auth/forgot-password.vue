<template>
  <UCard class="w-full max-w-md">
    <template #header>
      <h1 class="text-2xl font-bold text-center dark:text-gray-100">
        Forgot Password
      </h1>
    </template>
    <p class="text-gray-400 mb-4">
      We'll send you a link to reset your password.
    </p>
    <UForm
      ref="form"
      :schema="schema"
      :state="formState"
      @submit.prevent="handleResetPassword"
      class="space-y-4"
    >
      <UFormGroup label="Email" name="email">
        <UInput
          v-model="formState.email"
          type="email"
          placeholder="your@email.com"
        />
      </UFormGroup>
      <UButton type="submit" color="primary" :loading="isLoading" block
        >Send Reset Link</UButton
      >
    </UForm>
    <template #footer>
      <p class="text-center text-sm text-gray-600">
        Remember your password?
        <NuxtLink to="/auth/login" class="text-primary-600 hover:underline"
          >Log in</NuxtLink
        >
      </p>
    </template>
  </UCard>
</template>

<script setup lang="ts">
/**
 * @component ForgotPasswordPage
 * @description Password reset request page
 * Sends password reset email via Supabase auth
 */

import { z } from "zod";

const supabase = useSupabaseClient();
const toast = useToast();

definePageMeta({
  layout: "auth",
});

useHead({
  title: "Ledgerly | Forgot Password",
});

const formState = reactive({
  email: "",
});
const isLoading = ref(false);
const form = ref();

/**
 * Form validation schema
 * @constant {z.ZodObject}
 */
const schema = z.object({
  email: z.string().email("Invalid email"),
});

/**
 * Handles password reset request
 * @async
 * @function handleResetPassword
 * @throws {Error} If reset request fails
 */
const handleResetPassword = async () => {
  form.value.validate();
  isLoading.value = true;
  const { error } = await supabase.auth.resetPasswordForEmail(formState.email, {
    redirectTo: `${window.location.origin}/auth/new-password`,
  });
  isLoading.value = false;
  if (error) {
    return toast.add({
      title: `${error.message}` || "An error occurred",
      icon: "i-heroicons-exclamation-circle",
      color: "red",
    });
  }
  toast.add({
    title: `We've sent you an email!`,
    description:
      "Check your inbox for further instructions to reset your password.",
    icon: "i-heroicons-check-badge-solid",
  });
};
</script>
