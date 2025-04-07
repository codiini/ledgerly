<template>
  <div class="p-4 lg:p-8 lg:ml-64 space-y-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl">Payment Reminders</h2>
      <div class="flex gap-2">
        <UButton
          color="primary"
          @click="sendReminders"
          :loading="isSending"
          disabled
          icon="i-heroicons-envelope"
        >
          Send Reminders
        </UButton>
      </div>
    </div>

    <!-- Overdue Payments -->
    <UCard class="mb-6">
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium">Overdue Payments</h3>
          <UBadge color="red" size="lg">{{ overduePayments.length }}</UBadge>
        </div>
      </template>
      <UTable
        :rows="overduePayments"
        :columns="[
          {
            key: 'customer_name',
            label: 'Customer',
          },
          {
            key: 'phone',
            label: 'Phone',
          },
          {
            key: 'due_date',
            label: 'Due Date',
          },
          {
            key: 'days_overdue',
            label: 'Days Overdue',
          },
          {
            key: 'amount_due',
            label: 'Amount Due',
          },
          {
            key: 'actions',
            label: 'Actions',
            sortable: false,
          },
        ]"
      >
        <template #actions-data="{ row }">
          <div class="flex gap-2">
            <UButton
              color="primary"
              variant="ghost"
              icon="i-heroicons-envelope"
              @click="sendSingleReminder(row)"
              :loading="row.isSending"
            />
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-eye"
              @click="viewReminderHistory(row)"
            />
          </div>
        </template>
        <template #due_date-data="{ row }">
          {{ new Date(row.due_date).toLocaleDateString() }}
        </template>
        <template #amount_due-data="{ row }">
          {{ formatCurrency(row.amount_due) }}
        </template>
        <template #days_overdue-data="{ row }">
          <UBadge variant="subtle" color="orange" size="sm">{{
            row.days_overdue
          }}</UBadge>
        </template>
        <template #empty-state>
          <div class="flex flex-col items-center justify-center py-6">
            <UIcon
              name="i-heroicons-check-circle"
              class="text-green-500 text-4xl mb-2"
            />
            <p class="text-gray-500">No overdue payments found</p>
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Reminder History -->
    <UCard>
      <template #header>
        <h3 class="text-lg font-medium">Reminder History</h3>
      </template>
      <UTable
        :rows="reminderHistory"
        :columns="[
          {
            key: 'sent_at',
            label: 'Date',
          },
          {
            key: 'customer_name',
            label: 'Customer',
          },
          {
            key: 'message',
            label: 'Message',
          },
          {
            key: 'status',
            label: 'Status',
          },
        ]"
      >
        <template #sent_at-data="{ row }">
          {{
            `${new Date(row.sent_at).toLocaleDateString()} ${new Date(
              row.sent_at
            ).toLocaleTimeString()}`
          }}
        </template>

        <template #status-data="{ row }">
          <p
            :class="[row.status === 'sent' ? 'text-green-600' : 'text-red-600']"
            class="text-sm"
          >
            <UBadge
              variant="subtle"
              :color="row.status === 'sent' ? 'green' : 'red'"
              size="sm"
              >{{ row.status }}</UBadge
            >
          </p>
        </template>
        <template #message-data="{ row }">
          <p class="max-w-xs truncate">
            {{ row.message }}
          </p>
        </template>
        <template #empty-state>
          <div class="flex flex-col items-center justify-center py-6">
            <p class="text-gray-500">No reminder history found</p>
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Reminder History Modal -->
    <UModal v-model="isViewingHistory">
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">
            Reminder History for
            <span class="text-gray-400">{{ selectedCustomer?.name }}</span>
          </h3>
        </template>
        <UTable
          :rows="customerReminderHistory"
          :columns="[
            {
              key: 'status',
              label: 'Status',
            },
            {
              key: 'sent_at',
              label: 'Date',
            },
            {
              key: 'message',
              label: 'Message',
            },
          ]"
        >
          <template #sent_at-data="{ row }">
            {{
              `${new Date(row.sent_at).toLocaleDateString()} ${new Date(
                row.sent_at
              ).toLocaleTimeString()}`
            }}
          </template>

          <template #status-data="{ row }">
            <p
              :class="[
                row.status === 'sent' ? 'text-green-600' : 'text-red-600',
              ]"
              class="text-sm"
            >
              <UBadge
                variant="subtle"
                :color="row.status === 'sent' ? 'green' : 'red'"
                size="sm"
                >{{ row.status }}</UBadge
              >
            </p>
          </template>
          <template #message-data="{ row }">
            <p class="max-w-xs truncate">
              {{ row.message }}
            </p>
          </template>
          <template #empty-state>
            <div class="flex flex-col items-center justify-center py-6">
              <p class="text-gray-500">
                No reminder history found for this customer
              </p>
            </div>
          </template>
        </UTable>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
/**
 * @component PaymentRemindersPage
 * @description Manages payment reminders for overdue credit sales
 * Features:
 * - Display overdue payments with customer details
 * - Send individual or bulk payment reminders
 * - View reminder history by customer
 * - Track reminder delivery status
 */

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const toast = useToast();
const { formatCurrency } = useCurrency();

/**
 * Reactive state for reminder management
 * @type {Ref<Array>} overduePayments - List of overdue payments
 * @type {Ref<Array>} reminderHistory - Global reminder history
 * @type {Ref<Array>} customerReminderHistory - Selected customer's reminders
 * @type {Ref<Object|null>} selectedCustomer - Currently selected customer
 * @type {Ref<boolean>} isViewingHistory - Modal visibility state
 * @type {Ref<boolean>} isSending - Global sending state
 */
const overduePayments = ref([]);
const reminderHistory = ref([]);
const customerReminderHistory = ref([]);
const selectedCustomer = ref(null);
const isViewingHistory = ref(false);
const isSending = ref(false);

/**
 * Fetches overdue payments from database
 * Calculates days overdue and formats data for display
 * @async
 * @function fetchOverduePayments
 * @returns {Promise<void>}
 */
const fetchOverduePayments = async () => {
  const { data } = await supabase
    .from("credit_sales")
    .select(
      `
        id,
        customer_id,
        total_amount,
        paid_amount,
        due_date,
        customers (
          name,
          phone
        )
      `
    )
    .eq("status", "overdue")
    .eq("merchant_id", user.value.id)
    .order("due_date");

  if (data) {
    const today = new Date();

    overduePayments.value = data.map((sale) => {
      const dueDate = new Date(sale.due_date);
      const diffTime = Math.abs(today - dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        id: sale.id,
        customer_id: sale.customer_id,
        customer_name: sale.customers.name,
        phone: sale.customers.phone,
        due_date: sale.due_date,
        days_overdue: diffDays,
        amount_due: sale.total_amount - sale.paid_amount,
        isSending: false,
      };
    });
  }
};

/**
 * Fetches global reminder history
 * Limited to last 20 reminders
 * @async
 * @function fetchReminderHistory
 * @returns {Promise<void>}
 */
const fetchReminderHistory = async () => {
  const { data } = await supabase
    .from("reminders")
    .select(
      `
        id,
        credit_sale_id,
        sent_at,
        message,
        status,
        credit_sales (
          merchant_id,
          customers (
            name
          )
        )
      `
    )
    .eq("credit_sales.merchant_id", user.value.id)
    .order("sent_at", { ascending: false })
    .limit(20);

  if (data) {
    reminderHistory.value = data.map((reminder) => ({
      id: reminder.id,
      credit_sale_id: reminder.credit_sale_id,
      sent_at: reminder.sent_at,
      message: reminder.message,
      status: reminder.status,
      customer_name: reminder.credit_sales.customers.name,
    }));
  }
};

/**
 * Sends reminders to all overdue customers
 * @async
 * @function sendReminders
 * @returns {Promise<void>}
 */
const sendReminders = async () => {
  if (overduePayments.value.length === 0) {
    toast.add({
      title: "No overdue payments",
      description: "There are no overdue payments to send reminders for.",
    });
    return;
  }

  isSending.value = true;

  try {
    const { data } = await $fetch("/api/send-reminders");

    toast.add({
      title: "Reminders sent",
      description: `Successfully sent ${data.sent} reminder(s).`,
    });

    // Refresh data
    await Promise.all([fetchOverduePayments(), fetchReminderHistory()]);
  } catch (error) {
    toast.add({
      title: "Error",
      description: error.message || "Failed to send reminders",
      color: "red",
    });
  } finally {
    isSending.value = false;
  }
};

/**
 * Sends reminder to a specific customer
 * @async
 * @function sendSingleReminder
 * @param {Object} payment - Payment record with customer details
 * @param {string} payment.id - Credit sale ID
 * @param {string} payment.customer_name - Customer name for toast message
 * @returns {Promise<void>}
 */
const sendSingleReminder = async (payment) => {
  // Set loading state for this specific row
  const index = overduePayments.value.findIndex((p) => p.id === payment.id);
  if (index !== -1) {
    overduePayments.value[index].isSending = true;
  }

  try {
    const { data } = await $fetch("/api/send-single-reminder", {
      method: "POST",
      body: {
        creditSaleId: payment.id,
      },
    });

    toast.add({
      title: "Reminder sent",
      description: `Successfully sent reminder to ${payment.customer_name}.`,
      color: "green",
    });

    // Refresh data
    await Promise.all([fetchOverduePayments(), fetchReminderHistory()]);
  } catch (error) {
    toast.add({
      title: "Error",
      description: error.message || "Failed to send reminder",
      color: "red",
    });
  } finally {
    // Reset loading state
    if (index !== -1) {
      overduePayments.value[index].isSending = false;
    }
  }
};

/**
 * Views reminder history for specific customer
 * Opens modal with filtered reminder history
 * @async
 * @function viewReminderHistory
 * @param {Object} payment - Payment record with customer details
 * @param {string} payment.customer_id - Customer ID
 * @param {string} payment.customer_name - Customer name
 * @param {string} payment.id - Credit sale ID
 * @returns {Promise<void>}
 */
const viewReminderHistory = async (payment) => {
  selectedCustomer.value = {
    id: payment.customer_id,
    name: payment.customer_name,
  };

  const { data } = await supabase
    .from("reminders")
    .select(
      `
        id,
        credit_sale_id,
        sent_at,
        message,
        status
      `
    )
    .eq("credit_sale_id", payment.id)
    .order("sent_at", { ascending: false });

  customerReminderHistory.value = data || [];
  isViewingHistory.value = true;
};

// Initialize data on component mount
onMounted(async () => {
  await Promise.all([fetchOverduePayments(), fetchReminderHistory()]);
});
</script>
