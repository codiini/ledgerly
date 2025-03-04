<template>
  <UCard class="w-full max-w-md">
    <template #header>
      <h1 class="text-2xl font-bold text-center dark:text-gray-100">
        Create your Account
      </h1>
    </template>
    <UForm
      ref="formRef"
      :schema="schema"
      :state="formState"
      class="space-y-4"
      @submit.prevent="handleRegister"
    >
      <UFormGroup label="First Name" name="firstName">
        <UInput v-model="formState.firstName" placeholder="John" />
      </UFormGroup>
      <UFormGroup label="Last Name" name="lastName">
        <UInput v-model="formState.lastName" placeholder="Doe" />
      </UFormGroup>

      <UFormGroup label="Email" name="email">
        <UInput
          v-model="formState.email"
          type="email"
          placeholder="your@email.com"
        />
      </UFormGroup>

      <UFormGroup label="Password" name="password">
        <div class="relative">
          <UInput
            v-model="formState.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
          />
          <UButton
            :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
            variant="ghost"
            color="gray"
            size="xs"
            class="absolute right-2 top-1/2 -translate-y-1/2"
            @click="showPassword = !showPassword"
          />
        </div>
      </UFormGroup>

      <UButton type="submit" color="primary" :loading="isLoading" block
        >Register</UButton
      >
    </UForm>
    <template #footer>
      <p class="text-center text-sm text-gray-400">
        Already have an account?
        <NuxtLink to="/auth/login" class="text-primary-600 hover:underline"
          >Log in</NuxtLink
        >
      </p>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { z } from "zod";

const supabase = useSupabaseClient();
const toast = useToast();

definePageMeta({
  layout: "auth",
});

useHead({
  title: "UseLedgerly | Register",
});

const formState = reactive({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
});

const formRef = ref(null);
const showPassword = ref(false);

const schema = z.object({
  firstName: z.string().min(3, "First name is required"),
  lastName: z.string().min(3, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Must be at least 8 characters")
    .refine((value: string) => {
      formState.password = value;
      return true;
    }),
});

const isLoading = ref(false);

const handleRegister = async () => {
  formRef.value.validate();
  isLoading.value = true;
  const { error } = await supabase.auth.signUp({
    password: formState.password,
    email: formState.email,
    options: {
      data: {
        firstName: formState.firstName,
        lastName: formState.lastName,
      },
      emailRedirectTo: `${window.location.origin}/auth/confirm`,
    },
  });
  isLoading.value = false;
  if (error) {
    return toast.add({
      title: "An error occurred",
      description: "Please fill in the form to try again",
      icon: "i-heroicons-exclamation-circle",
      color: "red",
    });
  }
  toast.add({
    title: "Signup Successful!",
    description: "Open the email we sent you to verify your account!",
    icon: "i-heroicons-check-badge-solid",
  });

  clearForm();
};

const clearForm = () => {
  Object.assign(formState, {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
};
</script>
