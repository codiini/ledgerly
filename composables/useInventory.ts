import type { Inventory } from "~/types";
const TABLE_NAME = "inventory";

/** Error messages for different CRUD operations */
const ERROR_MESSAGES = {
    create: "Error while adding Inventory data",
    read: "Error fetching Inventory list",
    update: "Error while updating Inventory data"
}

/**
 * Vue composable for managing inventory data operations
 * @returns {Object} Inventory management methods and reactive references
 * @property {Ref<Inventory[]>} inventoryList - Reactive array of inventory items
 * @property {Function} fetchInventory - Fetches all inventory items for the current merchant
 * @property {Function} updateInventoryItem - Updates an existing inventory item
 * @property {Function} createInventoryItem - Creates a new inventory item
 * @property {Function} deleteInventoryItem - Deletes an inventory item
 */
export const useInventory = (): object => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const toast = useToast();

  const inventoryList = ref<Inventory[]>([]);

  const loadingStates = reactive({
    save: false,
    delete: false,
    fetch: false,
  });

    /**
   * Fetches all inventory items for the current merchant
   * @param {boolean} state - Loading state flag
   * @returns {Promise<void>}
   */
  const fetchInventory = async (state: boolean = false): Promise<void> => {
    loadingStates.fetch = state;
    let { data, error } = await supabase
      .from(`${TABLE_NAME}`)
      .select("*")
      .eq("merchant_id", user.value?.id)
      .order("name");
    loadingStates.fetch = false;
    //set a deleting state on each inventory item
    inventoryList.value = data as Inventory[];

    inventoryList.value?.map((item: Inventory) => ({
      ...item,
      deleting: false,
    }));

    if (error) {
      toast.add({
        title: `${ERROR_MESSAGES.read}`,
        description:
          `There was an ${ERROR_MESSAGES.read}. Please try again later.`,
        icon: "i-heroicons-exclamation-circle",
        color: "red",
      });
      return;
    }
  };

    /**
   * Updates an existing inventory item's information
   * @param {Object} params - Update parameters
   * @param {Partial<Inventory>} params.data - Inventory data to update
   * @param {string} params.id - ID of the inventory item to update
   * @returns {Promise<void>}
   */

  const updateInventoryItem = async ({
    data,
    id,
  }: {
    data: Partial<Inventory>;
    id: string;
  }): Promise<void> => {
    loadingStates.save = true;
    const { error } = await supabase
      .from(`${TABLE_NAME}`)
      .update(data)
      .eq("id", id)
      .eq("merchant_id", user.value?.id)
      .select();
    loadingStates.save = false;
    if (error) {
      return toast.add({
        title: `${ERROR_MESSAGES.update}`,
        description:
          `There was an ${ERROR_MESSAGES.update}. Please try again later.`,
        icon: "i-heroicons-exclamation-circle",
        color: "red",
      });
    }
    fetchInventory();
    toast.add({
      title: "Item updated successfully!",
      icon: "i-heroicons-check-badge-solid",
    });
  };

    /**
   * Creates a new inventory item
   * @param {Object} params - Create parameters
   * @param {Partial<Inventory>} params.data - Inventory data to create
   * @returns {Promise<Inventory|null>} Created inventory data or null if creation fails
   */
  const createInventoryItem = async ({ data }: { data: Partial<Inventory> }): Promise<Inventory | null> => {
    loadingStates.save = true;
    const { data: response, error } = await supabase
      .from(`${TABLE_NAME}`)
      .insert(data)
      .select();
    loadingStates.save = false;
    if (error) {
      toast.add({
        title: `${ERROR_MESSAGES.create}`,
        description:
          `There was an ${ERROR_MESSAGES.create}. Please try again later.`,
        icon: "i-heroicons-exclamation-circle",
        color: "red",
      });
      return null;
    }
    fetchInventory();
    toast.add({
      title: "Item created successfully!",
      icon: "i-heroicons-check-badge-solid",
    });
    return data[0];
  };

    /**
   * Deletes an inventory item by ID
   * @param {string} id - ID of the inventory item to delete
   * @returns {Promise<void>}
   * @throws {Error} If deletion fails
   */
  const deleteInventoryItem = async (id: string) => {
    loadingStates.delete = true;
    const { error } = await supabase
      .from(`${TABLE_NAME}`)
      .delete()
      .eq("id", id)
      .eq("merchant_id", user.value?.id);

    loadingStates.delete = false;
    if (error) {
      toast.add({
        title: "Error deleting item",
        description:
          "There was an error deleting the selected inventory item. Please try again later.",
        icon: "i-heroicons-exclamation-circle",
        color: "red",
      });
      return;
    }
    fetchInventory();
    toast.add({
      title: "Item deleted successfully!",
      icon: "i-heroicons-check-badge-solid",
    });
  };

  return {
    fetchInventory,
    updateInventoryItem,
    createInventoryItem,
    inventoryList,
    deleteInventoryItem,
  };
};
