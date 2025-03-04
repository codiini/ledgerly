<template>
  <div class="p-4 lg:p-8 lg:ml-64 space-y-6">
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl">Credit Sales</h2>
          <UButton
            icon="i-heroicons-plus"
            color="primary"
            @click="isAddingSale = true"
            label="New Transaction"
          />
        </div>
      </template>

      <UTable
        :rows="creditSales"
        :columns="[
          {
            key: 'created_at',
            label: 'Date',
          },
          {
            key: 'customer_name',
            label: 'Customer',
          },
          {
            key: 'total_amount',
            label: 'Total Amount',
          },
          {
            key: 'paid_amount',
            label: 'Paid Amount',
          },
          {
            key: 'due_date',
            label: 'Due Date',
          },
          {
            key: 'status',
            label: 'Status',
          },
          {
            key: 'actions',
            label: 'Actions',
            sortable: false,
          },
        ]"
      >
        <template #created_at-data="{ row }">
          {{ new Date(row.created_at).toLocaleDateString() }}
        </template>
        <template #total_amount-data="{ row }">
          {{ formatCurrency(row.total_amount) }}
        </template>
        <template #paid_amount-data="{ row }">
          {{ formatCurrency(row.paid_amount) }}
        </template>
        <template #due_date-data="{ row }">
          {{ new Date(row.due_date).toLocaleDateString() }}
        </template>

        <template #status-data="{ row }">
          <UBadge
            size="xs"
            :label="
              row.status === 'paid'
                ? 'Paid'
                : row.status === 'overdue'
                ? 'Overdue'
                : row.status === 'partial'
                ? 'Partial'
                : 'Pending'
            "
            :color="
              row.status === 'paid'
                ? 'emerald'
                : row.status === 'overdue'
                ? 'red'
                : row.status === 'partial'
                ? 'teal'
                : 'orange'
            "
            variant="subtle"
          />
        </template>

        <template #actions-data="{ row }">
          <div class="flex gap-2">
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-eye"
              @click="viewSaleDetails(row)"
            />
            <UButton
              v-if="row.status !== 'paid'"
              color="green"
              variant="ghost"
              icon="i-heroicons-banknotes"
              @click="recordPayment(row)"
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- New Credit Sale Modal -->
    <UModal v-model="isAddingSale">
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">New Credit Sale</h3>
        </template>
        <form @submit.prevent="saveSale">
          <div class="space-y-4">
            <UFormGroup label="Customer">
              <USelect
                v-model="saleForm.customer_id"
                :options="customerList"
                option-attribute="name"
                value-attribute="id"
                required
              ></USelect>
              <template v-if="!Boolean(customerList.length)" #help>
                <span class="text-gray-500 dark:text-gray-400 text-xs"
                  >Add a new customer
                  <NuxtLink
                    class="text-green-500"
                    to="/dashboard/customers?new=true"
                    >here</NuxtLink
                  >
                </span>
              </template>
            </UFormGroup>

            <UFormGroup label="Due Date">
              <UInput v-model="saleForm.due_date" type="date" required />
            </UFormGroup>

            <div class="border rounded-lg p-4">
              <h4 class="font-medium mb-2">Items</h4>
              <div
                v-for="(item, index) in saleForm.items"
                :key="index"
                class="grid grid-cols-12 gap-2 mb-2"
              >
                <div class="col-span-5">
                  <USelect
                    v-model="item.inventory_id"
                    :options="inventoryList"
                    option-attribute="name"
                    value-attribute="id"
                    @change="updateItemPrice(index)"
                  />
                </div>
                <div class="col-span-2">
                  <UInput v-model="item.quantity" type="number" min="1" />
                </div>
                <div class="col-span-3">
                  <UInput
                    v-model="item.unit_price"
                    type="number"
                    step="0.01"
                    readonly
                  />
                </div>
                <div class="col-span-2">
                  <UButton
                    color="red"
                    variant="ghost"
                    icon="i-heroicons-trash"
                    @click="saleForm.items.splice(index, 1)"
                  />
                </div>
              </div>
              <UButton class="mt-2" variant="ghost" @click="addItem">
                Add Item
              </UButton>
            </div>

            <div class="text-right">
              <p class="text-lg font-bold">
                Total: {{ formatCurrency(calculateTotal) }}
              </p>
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-4">
            <UButton color="gray" variant="ghost" @click="isAddingSale = false">
              Cancel
            </UButton>
            <UButton
              type="submit"
              color="primary"
              :disabled="!saleForm.items.length"
            >
              Create Sale
            </UButton>
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Record Payment Modal -->
    <UModal v-model="isRecordingPayment">
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">Record Payment</h3>
        </template>
        <form @submit.prevent="savePayment">
          <div class="space-y-4">
            <UFormGroup label="Amount">
              <UInput
                v-model="paymentForm.amount"
                step="0.01"
                type="number"
                min="0"
                :max="
                  selectedSale
                    ? selectedSale.total_amount - selectedSale.paid_amount
                    : 0
                "
                required
              >
                <!-- TODO: Add icon to auto set full amount -->
                <!-- <template #trailing>
                  <UButton
                    class="cursor-pointer"
                    color="gray"
                    variant="solid"
                    icon="i-heroicons-chevron-double-up"
                    @click="
                      selectedSale.total_amount - selectedSale.paid_amount
                    "
                    :padded="false"
                  />
                </template> -->
              </UInput>
            </UFormGroup>
            <UFormGroup label="Payment Method">
              <USelect
                v-model="paymentForm.payment_method"
                :options="['Cash', 'Bank Transfer', 'Check']"
                required
              />
            </UFormGroup>
          </div>
          <div class="flex justify-end gap-2 mt-4">
            <UButton
              color="gray"
              variant="ghost"
              @click="isRecordingPayment = false"
            >
              Cancel
            </UButton>
            <UButton type="submit" color="primary"> Record Payment </UButton>
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Sale Details Modal -->
    <UModal v-model="isViewingDetails">
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">Sale Details</h3>
        </template>
        <div v-if="selectedSale" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="font-medium text-xs text-gray-500">Customer</p>
              <p class="text-sm">{{ selectedSale.customer_name }}</p>
            </div>
            <div>
              <p class="font-medium text-xs text-gray-500">Date</p>
              <p class="text-sm">
                {{ new Date(selectedSale.created_at).toLocaleDateString() }}
              </p>
            </div>
            <div>
              <p class="font-medium text-xs text-gray-500">Status</p>
              <p class="text-sm">{{ selectedSale.status }}</p>
            </div>
            <div>
              <p class="font-medium text-xs text-gray-500">Due Date</p>
              <p class="text-sm">
                {{ new Date(selectedSale.due_date).toLocaleDateString() }}
              </p>
            </div>
          </div>

          <div class="pt-4">
            <h4 class="font-medium mb-2 text-gray-500">Items</h4>
            <UTable
              :rows="saleItems"
              :columns="[
                { key: 'name', label: 'Item' },
                { key: 'quantity', label: 'Quantity' },
                {
                  key: 'unit_price',
                  label: 'Unit Price',
                },
                {
                  key: 'total',
                  label: 'Total',
                },
              ]"
            >
              <template #unit_price-data="{ row }">
                {{ formatCurrency(row.unit_price) }}
              </template>
              <template #total-data="{ row }">
                {{ formatCurrency(row.total) }}
              </template>
            </UTable>
          </div>

          <div>
            <h4 class="font-medium mb-2 text-gray-500">Payments</h4>
            <UTable
              :rows="payments"
              :columns="[
                {
                  key: 'payment_date',
                  label: 'Date',
                },
                { key: 'payment_method', label: 'Method' },
                {
                  key: 'amount',
                  label: 'Amount',
                },
              ]"
            >
              <template #payment_date-data="{ row }">
                {{ new Date(row.payment_date).toLocaleDateString() }}
              </template>
              <template #amount-data="{ row }">
                {{ formatCurrency(row.amount) }}
              </template>
            </UTable>
          </div>

          <div class="text-right">
            <p class="text-lg font-bold">
              Balance:
              {{
                formatCurrency(
                  selectedSale.total_amount - selectedSale.paid_amount
                )
              }}
            </p>
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
interface SaleItem {
  inventory_id: string;
  quantity: number;
  unit_price: number;
}
const supabase = useSupabaseClient();

const { formatCurrency } = useCurrency();

const { creditSales, fetchCreditSales, createSaleRecord } = useSales();
const { customerList, fetchCustomers } = useCustomers();
const { inventoryList, fetchInventory } = useInventory();

const saleItems = ref([]);
const payments = ref([]);

const isAddingSale = ref(false);
const isRecordingPayment = ref(false);
const isViewingDetails = ref(false);
const selectedSale = ref(null);

const saleForm = ref({
  customer_id: "",
  due_date: "",
  items: [] as SaleItem[],
});

const paymentForm = ref({
  amount: 0,
  payment_method: "Cash",
});

const addItem = () => {
  saleForm.value.items.push({
    inventory_id: "",
    quantity: 1,
    unit_price: 0,
  });
};

const updateItemPrice = (index: number) => {
  const item = saleForm.value.items[index];
  const inventoryItem = inventoryList.value.find(
    (i) => i.id == item.inventory_id
  );
  if (inventoryItem) {
    item.unit_price = inventoryItem.unit_price;
  }
};

const calculateTotal = computed(() => {
  return saleForm.value.items.reduce((total, item) => {
    return total + item.quantity * item.unit_price;
  }, 0);
});

//TODO: Refactor and add types
const saveSale = async () => {
  const sale = await createSaleRecord({
    data: {
      customer_id: saleForm.value.customer_id,
      total_amount: calculateTotal.value,
      due_date: saleForm.value.due_date,
      paid_amount: 0,
    },
  });

  if (sale) {
    console.log("Sale ID", sale.id);
    await supabase.from("credit_sale_items").insert(
      saleForm.value.items.map((item) => ({
        credit_sale_id: sale.id,
        inventory_id: item.inventory_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }))
    );

    // Update inventory quantities
    for (const item of saleForm.value.items) {
      const inventoryItem = inventoryList.value.find(
        (i) => i.id === item.inventory_id
      );
      if (inventoryItem) {
        await supabase
          .from("inventory")
          .update({ quantity: inventoryItem.quantity - item.quantity })
          .eq("id", item.inventory_id);
      }
    }
  }

  isAddingSale.value = false;
  saleForm.value = {
    customer_id: "",
    due_date: "",
    items: [],
  };
  await fetchCreditSales(20);
};

const recordPayment = (sale) => {
  selectedSale.value = sale;
  paymentForm.value = {
    amount: 0,
    payment_method: "Cash",
  };
  isRecordingPayment.value = true;
};

const savePayment = async () => {
  if (!selectedSale.value) return;

  // Insert payment record
  await supabase.from("payments").insert({
    credit_sale_id: selectedSale.value.id,
    amount: paymentForm.value.amount,
    payment_method: paymentForm.value.payment_method,
  });

  // Update credit sale paid amount
  await supabase
    .from("credit_sales")
    .update({
      paid_amount: selectedSale.value.paid_amount + paymentForm.value.amount,
    })
    .eq("id", selectedSale.value.id);

  isRecordingPayment.value = false;
  selectedSale.value = null;
  paymentForm.value = {
    amount: 0,
    payment_method: "Cash",
  };
  await fetchCreditSales();
};

const viewSaleDetails = async (sale) => {
  selectedSale.value = sale;

  // Fetch sale items
  const { data: items } = await supabase
    .from("credit_sale_items")
    .select(
      `
        *,
        inventory (name)
      `
    )
    .eq("credit_sale_id", sale.id);

  saleItems.value =
    items?.map((item) => ({
      name: item.inventory.name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.quantity * item.unit_price,
    })) || [];

  // Fetch payments
  const { data: paymentData } = await supabase
    .from("payments")
    .select("*")
    .eq("credit_sale_id", sale.id)
    .order("payment_date", { ascending: false });

  payments.value = paymentData || [];

  isViewingDetails.value = true;
};

onMounted(async () => {
  await Promise.all([fetchCreditSales(), fetchCustomers(), fetchInventory()]);
});

const route = useRoute();

watch(
  () => route.query,
  () => {
    if (route.query.new) isAddingSale.value = true;
  },
  {
    immediate: true,
  }
);
</script>
