import type { Inventory } from "~/types";
const TABLE_NAME = "inventory";

const ERROR_MESSAGES = {
    create: "Error while adding customer information",
    read: "Error fetching customer list",
    update: "Error while updating customer information"
}

export const useInventory = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const toast = useToast();

  const inventoryList = ref<Inventory[]>([]);

  const loadingStates = reactive({
    save: false,
    delete: false,
    fetch: false,
  });

  const fetchInventory = async (state = false) => {
    loadingStates.fetch = state;
    let { data, error } = await supabase
      .from(`${TABLE_NAME}`)
      .select("*")
      .eq("merchant_id", user.value?.id)
      .order("name");
    loadingStates.fetch = false;
    //set a deleting state on each inventory item
    inventoryList.value = data as Inventory[];

    inventoryList.value?.map((customer: Inventory) => ({
      ...customer,
      deleting: false,
    }));

    if (error) {
      return toast.add({
        title: `${ERROR_MESSAGES.read}`,
        description:
          `There was an ${ERROR_MESSAGES.read}. Please try again later.`,
        icon: "i-heroicons-exclamation-circle",
        color: "red",
      });
    }
  };

  const updateInventoryItem = async ({
    data,
    id,
  }: {
    data: Partial<Inventory>;
    id: string;
  }) => {
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

  const createInventoryItem = async ({ data }: { data: Partial<Inventory> }) => {
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
      title: "Customer Created Successfully!",
      icon: "i-heroicons-check-badge-solid",
    });
    return data[0];
  };

  const deleteInventoryItem = async (id: string) => {
    loadingStates.delete = true;
    const { error } = await supabase
      .from(`${TABLE_NAME}`)
      .delete()
      .eq("id", id)
      .eq("merchant_id", user.value?.id);

    loadingStates.delete = false;
    if (error) {
      return toast.add({
        title: "Error deleting customer",
        description:
          "There was an error deleting the selected inventory item. Please try again later.",
        icon: "i-heroicons-exclamation-circle",
        color: "red",
      });
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
