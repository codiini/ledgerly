<template>
  <div class="lg:p-8 p-4 lg:ml-64">
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl">Inventory Management</h2>
          <UButton
            icon="i-heroicons-plus"
            color="primary"
            @click="openNewItemModal"
          >
            Add Item
          </UButton>
        </div>
      </template>

      <UTable :rows="inventoryList" :columns="columns">
        <template #cost-data="{ row }">
          {{ formatCurrency(row.unit_cost) }}
        </template>
        <template #value-data="{ row }">
          {{ formatCurrency(row.unit_cost * row.quantity) }}
        </template>
        <template #status-data="{ row }">
          <UBadge :color="row.quantity <= row.reorder_level ? 'red' : 'green'">
            {{ row.quantity <= row.reorder_level ? "Low Stock" : "In Stock" }}
          </UBadge>
        </template>
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
              inventoryList.find((inventory) => inventory.id == row.id)
                ?.deleting
            "
            @click="handleDelete(row.id)"
          />
        </template>
      </UTable>
    </UCard>

    <!-- Item Modal -->
    <UModal v-model="isModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">
            {{ isEditing ? "Edit Item" : "Add New Item" }}
          </h3>
        </template>

        <UForm :state="currentItem" class="space-y-4">
          <UFormGroup label="Item Name" required>
            <UInput v-model="currentItem.name" />
          </UFormGroup>

          <!-- <UFormGroup label="Item Number" required>
            <UInput v-model="currentItem.item_id" />
          </UFormGroup> -->

          <UFormGroup label="Description">
            <UTextarea v-model="currentItem.description" />
          </UFormGroup>

          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="Cost Per Item" required>
              <UInput
                v-model="currentItem.unit_cost"
                type="number"
                step="0.01"
                prefix="$"
              />
            </UFormGroup>

            <UFormGroup label="Unit Price">
              <UInput v-model="currentItem.unit_price" type="number" />
            </UFormGroup>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="Quantity" required>
              <UInput v-model="currentItem.quantity" type="number" />
            </UFormGroup>

            <UFormGroup label="Reorder Level">
              <UInput v-model="currentItem.reorder_level" type="number" />
            </UFormGroup>
          </div>
        </UForm>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="gray" @click="isModalOpen = false">
              Cancel
            </UButton>
            <UButton color="primary" @click="saveInventoryItem">
              {{ isEditing ? "Save Changes" : "Create Item" }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { Inventory } from "~/types/index";

const { formatCurrency } = useFormatCurrency();

const columns = [
  // { key: "itemId", label: "Item Number" },
  { key: "name", label: "Name" },
  { key: "cost", label: "Cost" },
  { key: "quantity", label: "Quantity" },
  { key: "value", label: "Total Value" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
];

const isModalOpen = ref(false);
const isEditing = ref(false);
const currentItem = ref<Inventory>({
  id: "",
  name: "",
  description: "",
  unit_cost: 0,
  unit_price: 0,
  quantity: 0,
  reorder_timeline: 0,
  reorder_level: 0,
});

const {
  fetchInventory,
  inventoryList,
  updateInventoryItem,
  createInventoryItem,
  deleteInventoryItem,
} = useInventory();

const openNewItemModal = () => {
  isEditing.value = false;
  currentItem.value = {
    name: "",
    description: "",
    unit_cost: 0,
    unit_price: 0,
    quantity: 0,
    reorder_timeline: 0,
    reorder_level: 0,
  };
  isModalOpen.value = true;
};

const openEditModal = (item: Inventory) => {
  isEditing.value = true;
  currentItem.value = { ...item };
  isModalOpen.value = true;
};

const handleDelete = async (id: string) => {
  //set the deleting state of the inventory item with the id to true
  inventoryList.value = inventoryList.value.map((inventory: Inventory) =>
    inventory.id === id ? { ...inventory, deleting: true } : inventory
  );
  await deleteInventoryItem(id);
  //set to false
  fetchInventory();
};

const saveInventoryItem = async () => {
  if (isEditing.value) {
    updateInventoryItem({
      data: currentItem.value,
      id: currentItem.value.id as string,
    });
  } else {
    createInventoryItem({
      data: currentItem.value,
    });
  }

  isModalOpen.value = false;
  isEditing.value = false;
  currentItem.value = {
    id: "",
    name: "",
    description: "",
    unit_cost: 0,
    unit_price: 0,
    quantity: 0,
    reorder_timeline: 0,
    reorder_level: 0,
  };
};

onMounted(fetchInventory);
</script>
