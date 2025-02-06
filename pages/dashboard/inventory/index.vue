<template>
    <div class="lg:p-8 p-4 lg:ml-64">
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h1 class="text-xl font-bold">Inventory Management</h1>
            <UButton
              icon="i-heroicons-plus"
              color="primary"
              @click="openNewItemModal"
            >
              Add Item
            </UButton>
          </div>
        </template>
  
        <UTable
          :rows="inventory"
          :columns="columns"
        >
          <template #cost-data="{ row }">
            ${{ row.cost.toFixed(2) }}
          </template>
          <template #value-data="{ row }">
            ${{ (row.cost * row.quantity).toFixed(2) }}
          </template>
          <template #status-data="{ row }">
            <UBadge
              :color="row.quantity <= row.reorderLevel ? 'red' : 'green'"
            >
              {{ row.quantity <= row.reorderLevel ? 'Low Stock' : 'In Stock' }}
            </UBadge>
          </template>
          <template #actions-data="{ row }">
            <UButton
              icon="i-heroicons-pencil"
              color="gray"
              variant="ghost"
              @click="openEditModal(row)"
            />
          </template>
        </UTable>
      </UCard>
  
      <!-- Item Modal -->
      <UModal v-model="isModalOpen">
        <UCard>
          <template #header>
            <h3 class="text-lg font-bold">
              {{ isEditing ? 'Edit Item' : 'Add New Item' }}
            </h3>
          </template>
          
          <UForm :state="currentItem" class="space-y-4">
            <UFormGroup label="Item Name" required>
              <UInput v-model="currentItem.name" />
            </UFormGroup>
            
            <UFormGroup label="Item Number" required>
              <UInput v-model="currentItem.itemNumber" />
            </UFormGroup>
            
            <UFormGroup label="Description">
              <UTextarea v-model="currentItem.description" />
            </UFormGroup>
            
            <div class="grid grid-cols-2 gap-4">
              <UFormGroup label="Cost Per Item" required>
                <UInput 
                  v-model="currentItem.cost" 
                  type="number" 
                  step="0.01"
                  prefix="$"
                />
              </UFormGroup>
              
              <UFormGroup label="Quantity" required>
                <UInput 
                  v-model="currentItem.quantity" 
                  type="number"
                />
              </UFormGroup>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <UFormGroup label="Reorder Level">
                <UInput 
                  v-model="currentItem.reorderLevel" 
                  type="number"
                />
              </UFormGroup>
              
              <UFormGroup label="Days Per Reorder">
                <UInput 
                  v-model="currentItem.daysPerReorder" 
                  type="number"
                />
              </UFormGroup>
            </div>
            
            <UFormGroup label="Location">
              <UInput v-model="currentItem.location" />
            </UFormGroup>
          </UForm>
  
          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton color="gray" @click="isModalOpen = false">
                Cancel
              </UButton>
              <UButton color="primary" @click="saveItem">
                {{ isEditing ? 'Save Changes' : 'Create Item' }}
              </UButton>
            </div>
          </template>
        </UCard>
      </UModal>
    </div>
  </template>
  
  <script setup>
  const inventory = ref([
    {
      id: 1,
      itemNumber: "INV001",
      name: "Product A",
      description: "Sample product description",
      cost: 10.00,
      quantity: 100,
      location: "Warehouse A, Shelf 2",
      reorderLevel: 20,
      daysPerReorder: 7
    },
    {
      id: 2,
      itemNumber: "INV002",
      name: "Product B",
      description: "Another product description",
      cost: 25.50,
      quantity: 15,
      location: "Warehouse B, Shelf 1",
      reorderLevel: 25,
      daysPerReorder: 14
    }
  ])
  
  const columns = [
    { key: 'itemNumber', label: 'Item Number' },
    { key: 'name', label: 'Name' },
    { key: 'cost', label: 'Cost' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'value', label: 'Total Value' },
    { key: 'location', label: 'Location' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ]
  
  const isModalOpen = ref(false)
  const isEditing = ref(false)
  const currentItem = ref({
    itemNumber: '',
    name: '',
    description: '',
    cost: 0,
    quantity: 0,
    location: '',
    reorderLevel: 0,
    daysPerReorder: 0
  })
  
  const openNewItemModal = () => {
    isEditing.value = false
    currentItem.value = {
      itemNumber: '',
      name: '',
      description: '',
      cost: 0,
      quantity: 0,
      location: '',
      reorderLevel: 0,
      daysPerReorder: 0
    }
    isModalOpen.value = true
  }
  
  const openEditModal = (item) => {
    isEditing.value = true
    currentItem.value = { ...item }
    isModalOpen.value = true
  }
  
  const saveItem = () => {
    if (isEditing.value) {
      const index = inventory.value.findIndex(item => item.id === currentItem.value.id)
      inventory.value[index] = { ...currentItem.value }
    } else {
      const newId = Math.max(...inventory.value.map(item => item.id)) + 1
      inventory.value.push({ ...currentItem.value, id: newId })
    }
    isModalOpen.value = false
  }
  </script>
  