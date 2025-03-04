<template>
  <div class="lg:p-8 p-4 lg:ml-64">
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl">Customers</h2>
          <UButton
            icon="i-heroicons-plus"
            color="primary"
            @click="openNewCustomerModal"
          >
            Add Customer
          </UButton>
        </div>
      </template>

      <UTable :rows="customerList" :columns="columns">
        <template #actions-data="{ row }">
          <UButton
            icon="i-heroicons-pencil"
            color="gray"
            variant="ghost"
            @click="openEditModal(row)"
          />
          <UButton
            icon="i-heroicons-trash"
            color="gray"
            variant="ghost"
            :loading="
              customerList.find((customer) => customer.id == row.id)?.deleting
            "
            @click="handleDelete(row.id)"
          />
        </template>
      </UTable>
    </UCard>

    <!-- Edit Customer Modal -->
    <UModal v-model="isEditModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">Edit Customer</h3>
        </template>

        <UForm :state="editingCustomer" class="space-y-4">
          <UFormGroup label="Name">
            <UInput v-model="editingCustomer.name" />
          </UFormGroup>
          <UFormGroup label="Phone">
            <UInput v-model="editingCustomer.phone" />
          </UFormGroup>
          <UFormGroup label="Email">
            <UInput v-model="editingCustomer.email" />
          </UFormGroup>
          <UFormGroup label="Addresss">
            <UInput v-model="editingCustomer.address" />
          </UFormGroup>
        </UForm>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="gray" @click="isEditModalOpen = false">
              Cancel
            </UButton>
            <UButton color="primary" @click="saveCustomer">
              Save Changes
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- New Customer Modal -->
    <UModal v-model="isNewModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">Add New Customer</h3>
        </template>

        <UForm :state="newCustomer" class="space-y-4" @submit="saveCustomer">
          <UFormGroup label="Name" required>
            <UInput v-model="newCustomer.name" />
          </UFormGroup>
          <UFormGroup label="Phone" required>
            <UInput v-model="newCustomer.phone" />
          </UFormGroup>
          <UFormGroup label="Email">
            <UInput v-model="newCustomer.email" type="email" />
          </UFormGroup>
          <UFormGroup label="Address">
            <UTextarea v-model="newCustomer.address" />
          </UFormGroup>
        </UForm>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="gray" @click="isNewModalOpen = false">
              Cancel
            </UButton>
            <UButton color="primary" @click="saveCustomer">
              Create Customer
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { Customer } from "~/types/index";

const {
  fetchCustomers,
  customerList,
  updateCustomer,
  createCustomer,
  deleteCustomer,
} = useCustomers();
// const customers = ref([
//   {
//     id: "C001",
//     name: "Alice Smith",
//     email: "alice.smith@example.com",
//     phone: "+2348123456969",
//     address: "456 High Street, Anytown, USA",
//     creditLimit: 10000.0,
//     paymentTerms: 30,
//     creditStatus: "active",
//     transactions: [
//       {
//         date: "2024-12-15",
//         description: "Initial Purchase",
//         amount: 5000.0,
//         daysOverdue: 0,
//       },
//       {
//         date: "2025-01-01",
//         description: "Partial Payment",
//         amount: -1000.0,
//         daysOverdue: 0,
//       },
//     ],
//   },
// ]);
const isEditModalOpen = ref(false);
const isNewModalOpen = ref(false);
const editingCustomer = ref<Customer>({
  id: "",
  name: "",
  email: "",
  phone: "",
  address: "",
});
const newCustomer = ref({
  name: "",
  email: "",
  phone: "",
  address: "",
});

const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "actions", label: "Actions" },
];

const openNewCustomerModal = () => {
  newCustomer.value = {
    name: "",
    email: "",
    phone: "",
    address: "",
  };
  isNewModalOpen.value = true;
};

const openEditModal = (customer: Customer) => {
  editingCustomer.value = { ...customer };
  isEditModalOpen.value = true;
};

const handleDelete = async (id: string) => {
  //set the deleting state of the customer with the id to true
  customerList.value = customerList.value.map((customer: Customer) =>
    customer.id === id ? { ...customer, deleting: true } : customer
  );
  await deleteCustomer(id);
  //set to false
  fetchCustomers();
};

const saveCustomer = async () => {
  if (isEditModalOpen.value) {
    updateCustomer({
      data: editingCustomer.value,
      id: editingCustomer.value.id,
    });
  } else {
    createCustomer({
      data: newCustomer.value,
    });
  }

  isNewModalOpen.value = false;
  isEditModalOpen.value = false;
  newCustomer.value = {
    name: "",
    phone: "",
    email: "",
    address: "",
  };
};

onMounted(fetchCustomers);
</script>
