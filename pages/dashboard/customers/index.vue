<template>
  <div class="lg:p-8 p-4 lg:ml-64">
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h1 class="text-xl font-bold">Customers</h1>
          <UButton
            icon="i-heroicons-plus"
            color="primary"
            @click="openNewCustomerModal"
          >
            Add Customer
          </UButton>
        </div>
      </template>

      <UTable :rows="customers" :columns="columns">
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
            @click="deleteCustomer(row)"
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
            <UButton color="primary" @click="updateCustomer">
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

        <UForm :state="newCustomer" class="space-y-4" @submit="createCustomer">
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
            <UButton color="primary" @click="createCustomer">
              Create Customer
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
const customers = ref([
  {
    id: "C001",
    name: "Alice Smith",
    email: "alice.smith@example.com",
    phone: "+2348123456969",
    address: "456 High Street, Anytown, USA",
    creditLimit: 10000.0,
    paymentTerms: 30,
    creditStatus: "active",
    transactions: [
      {
        date: "2024-12-15",
        description: "Initial Purchase",
        amount: 5000.0,
        daysOverdue: 0,
      },
      {
        date: "2025-01-01",
        description: "Partial Payment",
        amount: -1000.0,
        daysOverdue: 0,
      },
    ],
  },
  {
    id: "C002",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+2348123456969",
    address: "123 Main Street, Somewhere, USA",
    creditLimit: 5000.0,
    paymentTerms: 60,
    creditStatus: "warning",
    transactions: [
      {
        date: "2024-11-25",
        description: "Bulk Order",
        amount: 4500.0,
        daysOverdue: 45,
      },
    ],
  },
  {
    id: "C003",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "+2348123456969",
    address: "789 Oak Road, Elsewhere, USA",
    creditLimit: 15000.0,
    paymentTerms: 45,
    creditStatus: "suspended",
    transactions: [
      {
        date: "2024-10-15",
        description: "Equipment Purchase",
        amount: 12000.0,
        daysOverdue: 90,
      },
    ],
  },
]);
const isEditModalOpen = ref(false);
const isNewModalOpen = ref(false);
const editingCustomer = ref({});
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

const openEditModal = (customer) => {
  editingCustomer.value = { ...customer };
  isEditModalOpen.value = true;
};

const createCustomer = async () => {
  // Implement create logic here
  isNewModalOpen.value = false;
};

const deleteCustomer = async(customer) =>{
  
}

const updateCustomer = async () => {
  // Implement update logic here
  isEditModalOpen.value = false;
};
</script>
