<script setup>
import { ref } from "vue";
import { useFormatCurrency } from "#imports";
const supabase = useSupabaseClient();

const totalOutstanding = ref(0);
const overdueCount = ref(0);
const lowStockCount = ref(0);
const numberOfCustomers = ref(0);

const user = useSupabaseUser();

const { creditSales, fetchCreditSales } = useSales();
const { formatCurrency } = useFormatCurrency();

onMounted(async () => {
  const { data: outstandingData } = await supabase
    .from("credit_sales")
    .select("total_amount, paid_amount")
    .eq("merchant_id", user.value?.id)
    .neq("status", "paid");

  totalOutstanding.value =
    outstandingData?.reduce(
      (acc, curr) => acc + (curr.total_amount - curr.paid_amount),
      0
    ) || 0;

  const { count: overdue } = await supabase
    .from("credit_sales")
    .select("*", { count: "exact" })
    .eq("merchant_id", user.value?.id)
    .eq("status", "overdue");

  overdueCount.value = overdue || 0;

  const { data: inventoryData } = await supabase
    .from("inventory")
    .select("quantity, reorder_level")
    .eq("merchant_id", user.value?.id);

  lowStockCount.value =
    inventoryData?.filter((item) => item.quantity < item.reorder_level)
      .length || 0;

  const { count: customerCount } = await supabase
    .from("customers")
    .select("*", { count: "exact" })
    .eq("merchant_id", user.value?.id);

  numberOfCustomers.value = customerCount || 0;

  fetchCreditSales();
});

const stats = ref([
  {
    name: "Total Debt Owed",
    get value() {
      return formatCurrency(totalOutstanding.value);
    },
    increasing: true,
    icon: "i-heroicons-currency-dollar",
  },
  {
    name: "Overdue Payments",
    value: overdueCount,
    increasing: false,
    icon: "i-heroicons-exclamation-circle",
  },
  {
    name: "Low Stock Count",
    value: lowStockCount,
    increasing: false,
    icon: "i-heroicons-calendar",
  },
  {
    name: "Customers",
    value: numberOfCustomers,
    increasing: true,
    icon: "i-heroicons-users",
  },
]);

const selectedPeriod = ref("Last 6 months");

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "emerald";
    case "pending":
      return "orange";
    case "overdue":
      return "red";
    case "partial":
      return "teal";
    default:
      return "gray";
  }
};

useHead({
  title: "UseLedgerly | Dashboard",
});
</script>

<template>
  <div class="p-4 lg:p-8 lg:ml-64 space-y-6">
    <!-- Page Header -->
    <div class="flex justify-end items-center">
      <UButton
        to="/dashboard/transactions?new=true"
        icon="i-heroicons-plus"
        label="New Transaction"
      />
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard v-for="stat in stats" :key="stat.name" class="relative">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-gray-500">{{ stat.name }}</p>
            <p class="text-2xl font-semibold mt-1">
              {{ stat.value }}
            </p>
          </div>
          <UIcon
            :name="stat.icon"
            class="w-5 h-5"
            :class="stat.increasing ? 'text-green-600' : 'text-red-600'"
          />
        </div>
        <!-- <div class="flex items-center mt-2">
          <UIcon
            :name="
              stat.increasing
                ? 'i-heroicons-arrow-trending-up'
                : 'i-heroicons-arrow-trending-down'
            "
            class="w-4 h-4 mr-1"
            :class="stat.increasing ? 'text-green-600' : 'text-red-600'"
          />
          <span
            :class="stat.increasing ? 'text-green-600' : 'text-red-600'"
            class="text-sm font-medium"
          >
            {{ stat.change }}
          </span>
        </div> -->
      </UCard>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 gap-6">
      <!-- Recent Transactions -->
      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Recent Transactions</h2>
            <UButton
              to="/dashboard/transactions"
              color="gray"
              variant="ghost"
              icon="i-heroicons-arrow-right"
              label="View All"
            />
          </div>
        </template>

        <UTable
          :rows="creditSales"
          :columns="[
            { key: 'customer_name', label: 'Customer' },
            { key: 'total_amount', label: 'Amount' },
            { key: 'status', label: 'Status' },
            { key: 'due_date', label: 'Date' },
          ]"
        >
          <template #total_amount-data="{ row }">
            {{ formatCurrency(row.total_amount) }}
          </template>
          <template #status-data="{ row }">
            <UBadge
              variant="subtle"
              :color="getStatusColor(row.status)"
              size="sm"
              :label="row.status"
            />
          </template>
        </UTable>
      </UCard>

      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Debt vs Collections by Month</h2>
          </div>
        </template>
        <DashboardDebtCollectionChart />
      </UCard>
    </div>
  </div>
</template>
