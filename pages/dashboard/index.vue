<script setup>
import { ref } from "vue";

const stats = ref([
  {
    name: "Total Outstanding",
    value: "₦2,432,340",
    change: "+12.3%",
    increasing: true,
    icon: "i-heroicons-currency-dollar",
  },
  {
    name: "Overdue Payments",
    value: "₦543,550",
    change: "+4.5%",
    increasing: true,
    icon: "i-heroicons-exclamation-circle",
  },
  {
    name: "Due This Week",
    value: "₦125,000",
    change: "-2.3%",
    increasing: false,
    icon: "i-heroicons-calendar",
  },
  {
    name: "Active Debtors",
    value: "245",
    change: "+5.2%",
    increasing: true,
    icon: "i-heroicons-users",
  },
]);

const recentTransactions = ref([
  {
    id: 1,
    debtor: "ABC Trading",
    amount: "₦125,000",
    type: "Credit Sale",
    status: "Pending",
    date: "2024-02-01",
  },
  {
    id: 2,
    debtor: "XYZ Stores",
    amount: "₦75,000",
    type: "Payment",
    status: "Completed",
    date: "2024-02-01",
  },
  {
    id: 3,
    debtor: "Global Merchants",
    amount: "₦250,000",
    type: "Credit Sale",
    status: "Overdue",
    date: "2024-01-30",
  },
]);

const chartData = {
  labels: ["January", "February", "March", "April", "May", "June"],
  datasets: [
    {
      label: "Collections",
      data: [4000, 3000, 2000, 2780, 1890, 2390],
      borderColor: "#4F46E5",
      tension: 0.4,
    },
    {
      label: "Outstanding Debt",
      data: [2400, 1398, 9800, 3908, 4800, 3800],
      borderColor: "#EF4444",
      tension: 0.4,
    },
  ],
};

const upcomingPayments = ref([
  {
    debtor: "ABC Trading",
    amount: "₦50,000",
    dueDate: "2024-02-05",
  },
  {
    debtor: "XYZ Stores",
    amount: "₦75,000",
    dueDate: "2024-02-07",
  },
  {
    debtor: "Global Merchants",
    amount: "₦100,000",
    dueDate: "2024-02-10",
  },
]);

const selectedPeriod = ref("Last 6 months");

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

useHead({
  title: "DebtWise | Dashboard",
});
</script>

<template>
  <div class="p-4 lg:p-8 lg:ml-64 space-y-6">
    <!-- Page Header -->
    <div class="flex justify-end items-center">
      <UButton icon="i-heroicons-plus" label="New Transaction" />
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard v-for="stat in stats" :key="stat.name" class="relative">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-gray-500">{{ stat.name }}</p>
            <p class="text-2xl font-semibold mt-1">{{ stat.value }}</p>
          </div>
          <UIcon
            :name="stat.icon"
            class="w-5 h-5"
            :class="stat.increasing ? 'text-green-600' : 'text-red-600'"
          />
        </div>
        <div class="flex items-center mt-2">
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
        </div>
      </UCard>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Transactions -->
      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Recent Transactions</h2>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-arrow-right"
              label="View All"
            />
          </div>
        </template>

        <UTable
          :rows="recentTransactions"
          :columns="[
            { key: 'debtor', label: 'Debtor' },
            { key: 'amount', label: 'Amount' },
            { key: 'type', label: 'Type' },
            { key: 'status', label: 'Status' },
            { key: 'date', label: 'Date' },
          ]"
        >
          <template #status-data="{ row }">
            <UBadge
              :color="getStatusColor(row.status)"
              size="sm"
              :label="row.status"
            />
          </template>
        </UTable>
      </UCard>

      <!-- Upcoming Payments -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Upcoming Payments</h2>
        </template>

        <ul class="divide-y divide-gray-100">
          <li
            v-for="payment in upcomingPayments"
            :key="payment.debtor"
            class="py-3"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">{{ payment.debtor }}</p>
                <p class="text-sm text-gray-500">Due: {{ payment.dueDate }}</p>
              </div>
              <p class="font-semibold">{{ payment.amount }}</p>
            </div>
          </li>
        </ul>
      </UCard>

      <!-- Chart -->
      <UCard class="lg:col-span-3">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Collections vs Debt Trend</h2>
            <USelect
              v-model="selectedPeriod"
              :options="['Last 6 months', 'Last 12 months', 'This year']"
              placeholder="Select period"
            />
          </div>
        </template>

        <!-- For the chart, you'll need to install and import a Vue chart library -->
        <div class="h-80">
          <!-- Add your chart component here -->
          <UAlert icon="i-heroicons-information-circle">
            To add the chart, install a Vue charting library like Chart.js with
            vue-chartjs:
            <UCode>npm install vue-chartjs chart.js</UCode>
          </UAlert>
        </div>
      </UCard>
    </div>
  </div>
</template>
