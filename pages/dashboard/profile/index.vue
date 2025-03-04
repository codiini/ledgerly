<template>
  <div class="p-4 lg:p-8 lg:ml-64 space-y-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl">Profile Settings</h2>
      <UButton
        color="primary"
        @click="saveSettings"
        :loading="isSaving"
        :disabled="!hasChanges"
      >
        Save Changes
      </UButton>
    </div>

    <div class="grid w-full grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Store Information -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">Store Information</h3>
        </template>
        <div class="space-y-4">
          <UFormGroup label="Store Name" required>
            <UInput
              v-model="form.store_name"
              placeholder="Enter your store name"
            />
          </UFormGroup>

          <UFormGroup label="Email Address">
            <UInput
              v-model="form.email"
              type="email"
              placeholder="store@example.com"
            />
          </UFormGroup>

          <UFormGroup label="Phone Number">
            <UInput v-model="form.phone" placeholder="+1234567890" />
          </UFormGroup>

          <UFormGroup label="Address">
            <UTextarea
              v-model="form.address"
              placeholder="Store address"
              :rows="3"
            />
          </UFormGroup>
        </div>
      </UCard>

      <!-- Currency Settings -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">Currency Settings</h3>
        </template>
        <div class="gap-4 grid grid-cols-2 items-center">
          <UFormGroup label="Currency" required>
            <USelect
              v-model="form.currency"
              :options="currencies"
              option-attribute="name"
              value-attribute="code"
              @update:model-value="updateCurrencySymbol"
            />
          </UFormGroup>

          <UFormGroup label="Currency Symbol" required>
            <UInput v-model="form.currency_symbol" placeholder="$" />
          </UFormGroup>

          <div class="mt-4">
            <h4 class="font-medium mb-2">Preview</h4>
            <p>
              Amount:
              <span class="font-bold">{{ computeFormatCurrency }}</span>
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- User Account -->
    <UCard class="mt-6">
      <template #header>
        <h3 class="text-lg font-medium">User Account</h3>
      </template>
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <div
            class="bg-blue-100 text-blue-800 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold"
          >
            {{ userInitials }}
          </div>
          <div>
            <p class="font-medium">{{ user?.email }}</p>
            <p class="text-sm text-gray-500">Administrator</p>
          </div>
        </div>

        <UDivider />

        <div class="mt-4">
          <UButton color="red" variant="ghost" @click="logout()">
            Sign Out
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { currencies } from "#imports";
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const toast = useToast();

const { formatCurrency } = useCurrency();

const computeFormatCurrency = computed(() => {
  return formatCurrency(123456, form.value.currency);
});

const { userInitials } = useUser();

const originalForm = ref({});
const form = ref({
  store_name: "",
  email: "",
  phone: "",
  address: "",
  currency: "USD",
  currency_symbol: "$",
});
const isSaving = ref(false);

const hasChanges = computed(() => {
  return JSON.stringify(originalForm.value) !== JSON.stringify(form.value);
});

const updateCurrencySymbol = () => {
  const selectedCurrency = currencies.find(
    (c) => c.code === form.value.currency
  );
  if (selectedCurrency) {
    form.value.currency_symbol = selectedCurrency.symbol;
  }
};

const fetchSettings = async () => {
  const { data } = await supabase
    .from("store_settings")
    .select("*")
    .eq("user_id", user.value.id)
    .single();

  if (data) {
    form.value = { ...data };
    originalForm.value = { ...data };
  }
};

const saveSettings = async () => {
  isSaving.value = true;

  try {
    const { error } = await supabase
      .from("store_settings")
      .update({
        ...form.value,
        updated_at: new Date().toISOString(),
      })
      .eq("id", form.value.id);

    if (error) throw error;

    originalForm.value = { ...form.value };
    toast.add({
      title: "Settings saved",
      description: "Your profile settings have been updated successfully.",
      color: "green",
    });
  } catch (error) {
    toast.add({
      title: "Error",
      description: error.message || "Failed to save settings",
      color: "red",
    });
  } finally {
    isSaving.value = false;
  }
};

const logout = async () => {
  const { error } = await supabase.auth.signOut();
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

onMounted(fetchSettings);
</script>
