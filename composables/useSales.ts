import type { Inventory } from "~/types";
const TABLE_NAME = "credit_sales";

/** Error messages for different CRUD operations */
const ERROR_MESSAGES = {
  create: "Error while adding customer information",
  read: "Error fetching customer list",
  update: "Error while updating customer information",
};

/**
 * Vue composable for managing credit sales operations
 * @returns {Object} Credit sales management methods and reactive references
 * @property {Ref<Inventory[]>} creditSales - Reactive array of credit sales records
 * @property {Function} fetchCreditSales - Fetches credit sales records for the current merchant
 * @property {Function} updateCreditSaleRecord - Updates an existing credit sale record
 * @property {Function} createSaleRecord - Creates a new credit sale record
 * @property {Function} deleteCreditSaleRecord - Deletes a credit sale record
 */
export const useSales = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const toast = useToast();

  const creditSales = ref<Inventory[]>([]);

  const loadingStates = reactive({
    save: false,
    delete: false,
    fetch: false,
  });

  /**
   * Fetches credit sales records for the current merchant
   * @param {number} limit - Maximum number of records to fetch (default: 5)
   * @param {boolean} state - Loading state flag
   * @returns {Promise<void>}
   */
  const fetchCreditSales = async (limit: number = 5, state = false) => {
    loadingStates.fetch = state;
    let { data, error } = await supabase
      .from(`${TABLE_NAME}`)
      .select(
        `
        *,
        customers:customers!credit_sales_customer_id_fkey(name)
      `
      ).limit(limit)
      .eq("merchant_id", user.value?.id)
      .order("created_at", { ascending: false });
    loadingStates.fetch = false;

    //set a deleting state and customer_name on each inventory item
    creditSales.value =
      data.map(({ customers, ...sale }) => ({
        ...sale,
        customer_name: customers.name,
        deleting: false,
      })) || [];

    if (error) {
      return toast.add({
        title: `${ERROR_MESSAGES.read}`,
        description: `There was an ${ERROR_MESSAGES.read}. Please try again later.`,
        icon: "i-heroicons-exclamation-circle",
        color: "red",
      });
    }
  };

  /**
   * Updates an existing credit sale record
   * @param {Object} params - Update parameters
   * @param {Partial<Inventory>} params.data - Credit sale data to update
   * @param {string} params.id - ID of the credit sale record to update
   * @returns {Promise<void>}
   */
  const updateCreditSaleRecord = async ({
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
        description: `There was an ${ERROR_MESSAGES.update}. Please try again later.`,
        icon: "i-heroicons-exclamation-circle",
        color: "red",
      });
    }
    fetchCreditSales();
    toast.add({
      title: "Item updated successfully!",
      icon: "i-heroicons-check-badge-solid",
    });
  };

  /**
   * Creates a new credit sale record
   * @param {Object} params - Create parameters
   * @param {Partial<Inventory>} params.data - Credit sale data to create
   * @returns {Promise<Inventory|null>} Created credit sale data or null if creation fails
   */
  const createSaleRecord = async ({ data }: { data: Partial<Inventory> }) => {
    loadingStates.save = true;
    const { data: response, error } = await supabase
      .from(`${TABLE_NAME}`)
      .insert(data)
      .select();
    loadingStates.save = false;
    if (error) {
      toast.add({
        title: `${ERROR_MESSAGES.create}`,
        description: `There was an ${ERROR_MESSAGES.create}. Please try again later.`,
        icon: "i-heroicons-exclamation-circle",
        color: "red",
      });
      return null;
    }
    return response[0];
    // fetchCreditSales();
    // toast.add({
    //   title: "Customer Created Successfully!",
    //   icon: "i-heroicons-check-badge-solid",
    // });
  };

  /**
   * Deletes a credit sale record by ID
   * @param {string} id - ID of the credit sale record to delete
   * @returns {Promise<void>}
   * @throws {Error} If deletion fails
   */
  const deleteCreditSaleRecord = async (id: string) => {
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
    fetchCreditSales();
    toast.add({
      title: "Item deleted successfully!",
      icon: "i-heroicons-check-badge-solid",
    });
  };

  return {
    fetchCreditSales,
    updateCreditSaleRecord,
    createSaleRecord,
    creditSales,
    deleteCreditSaleRecord,
  };
};
