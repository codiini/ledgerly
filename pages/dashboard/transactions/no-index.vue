<script setup>
import { ref } from "vue";

const isNewTransactionModalOpen = ref(false);
const selectedCustomer = ref(null);
const transactionType = ref("credit");
const amount = ref("");
const dueDate = ref("");
const notes = ref("");

// Sample data - replace with Supabase fetch
const transactions = ref([
  {
    id: 1,
    customer: "ABC Trading",
    amount: "₦125,000",
    type: "Credit Sale",
    status: "Pending",
    dueDate: "2024-02-15",
    date: "2024-02-01",
    notes: "Monthly stock purchase",
  },
  {
    id: 2,
    customer: "XYZ Stores",
    amount: "₦75,000",
    type: "Payment",
    status: "Completed",
    dueDate: null,
    date: "2024-02-01",
    notes: "Partial payment for invoice #123",
  },
]);

const customers = ref([
  { id: 1, name: "ABC Trading" },
  { id: 2, name: "XYZ Stores" },
  { id: 3, name: "Global Merchants" },
]);

const columns = [
  { key: "date", label: "Date" },
  { key: "customer", label: "Customer" },
  { key: "type", label: "Type" },
  { key: "amount", label: "Amount" },
  { key: "status", label: "Status" },
  { key: "dueDate", label: "Due Date", sortable: true },
  { key: "actions", label: "" },
];

const filter = ref("");
const page = ref(1);
const pageCount = ref(10);

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "success";
    case "pending":
      return "warning";
    case "overdue":
      return "danger";
    default:
      return "gray";
  }
};

const handleNewTransaction = () => {
  // Add validation here
  const newTransaction = {
    id: transactions.value.length + 1,
    customer: selectedCustomer.value.name,
    amount: `₦${amount.value}`,
    type: transactionType.value === "credit" ? "Credit Sale" : "Payment",
    status: "Pending",
    dueDate: dueDate.value,
    date: new Date().toISOString().split("T")[0],
    notes: notes.value,
  };

  transactions.value.unshift(newTransaction);
  resetForm();
  isNewTransactionModalOpen.value = false;
};

const resetForm = () => {
  selectedCustomer.value = null;
  transactionType.value = "credit";
  amount.value = "";
  dueDate.value = "";
  notes.value = "";
};

const openTransactionDetails = (transaction) => {
  // Implement view/edit transaction details
  console.log("View transaction:", transaction);
};
</script>

<template>
  <div class="p-4 lg:p-8 lg:ml-64 space-y-6">
    <!-- Page Header -->
    <!-- <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold">Transactions</h1>
        <p class="text-gray-500 mt-1">
          Manage customer credit sales and payments
        </p>
      </div>
      <UButton
        icon="i-heroicons-plus"
        label="New Transaction"
        @click="isNewTransactionModalOpen = true"
      />
    </div> -->

    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h1 class="text-xl font-bold">Transactions</h1>
          <UButton
            icon="i-heroicons-plus"
            color="primary"
            @click="isNewTransactionModalOpen = true"
            label="New Transaction"
          />
        </div>
      </template>
      <!-- Filters -->
      <div class="flex gap-4">
        <UInput
          v-model="filter"
          icon="i-heroicons-magnifying-glass"
          placeholder="Search transactions..."
          class="max-w-sm"
        />
        <USelectMenu
          v-model="selectedStatus"
          :options="['All', 'Pending', 'Completed', 'Overdue']"
          placeholder="Filter by status"
        />
        <UButton
          color="gray"
          variant="soft"
          icon="i-heroicons-funnel"
          label="More filters"
        />
      </div>

      <!-- Transactions Table -->
      <UTable
        :rows="transactions"
        :columns="columns"
        :search="filter"
        @select="openTransactionDetails"
      >
        <!-- Custom column renderers -->
        <template #amount-data="{ row }">
          <span :class="row.type === 'Payment' ? 'text-green-600' : ''">
            {{ row.amount }}
          </span>
        </template>

        <template #status-data="{ row }">
          <UBadge
            :color="getStatusColor(row.status)"
            :label="row.status"
            size="sm"
          />
        </template>

        <template #dueDate-data="{ row }">
          <span v-if="row.dueDate">{{ row.dueDate }}</span>
          <span v-else>-</span>
        </template>

        <template #actions-data="{}">
          <UDropdown
            :items="[
              { label: 'View Details', icon: 'i-heroicons-eye' },
              { label: 'Edit', icon: 'i-heroicons-pencil' },
              { label: 'Delete', icon: 'i-heroicons-trash', color: 'red' },
            ]"
          >
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-ellipsis-vertical"
            />
          </UDropdown>
        </template>
      </UTable>

      <!-- Pagination -->
      <div class="flex justify-end">
        <UPagination
          v-model="page"
          :page-count="pageCount"
          :total="transactions.length"
        />
      </div>

      <!-- New Transaction Modal -->
      <UModal v-model="isNewTransactionModalOpen" prevent-close>
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="text-xl font-semibold">New Transaction</h3>
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-x-mark"
                @click="isNewTransactionModalOpen = false"
              />
            </div>
          </template>

          <form @submit.prevent="handleNewTransaction" class="space-y-4">
            <!-- Customer Selection -->
            <UFormGroup label="Customer">
              <USelect
                v-model="selectedCustomer"
                :options="customers"
                option-attribute="name"
                placeholder="Select customer"
                searchable
                required
              />
            </UFormGroup>

            <!-- Transaction Type -->
            <UFormGroup label="Transaction Type">
              <URadioGroup
                v-model="transactionType"
                :options="[
                  { label: 'Credit Sale', value: 'credit' },
                  { label: 'Payment', value: 'payment' },
                ]"
                class="flex gap-4"
              />
            </UFormGroup>

            <!-- Amount -->
            <UFormGroup label="Amount">
              <UInputAddon>₦</UInputAddon>
              <UInput
                v-model="amount"
                type="number"
                placeholder="Enter amount"
                required
              />
            </UFormGroup>

            <!-- Due Date (only for credit sales) -->
            <UFormGroup v-if="transactionType === 'credit'" label="Due Date">
              <UInput v-model="dueDate" type="date" required />
            </UFormGroup>

            <!-- Notes -->
            <UFormGroup label="Notes">
              <UTextarea
                v-model="notes"
                placeholder="Add transaction notes..."
                rows="3"
              />
            </UFormGroup>

            <!-- <template #footer>
            <div class="flex justify-end gap-3">
              <UButton
                color="gray"
                variant="soft"
                label="Cancel"
                @click="isNewTransactionModalOpen = false"
              />
              <UButton
                type="submit"
                color="primary"
                label="Create Transaction"
              />
            </div>
          </template> -->
          </form>
        </UCard>
      </UModal>
    </UCard>
  </div>
</template>
