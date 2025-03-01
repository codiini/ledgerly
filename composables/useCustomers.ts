import type { Customer } from "~/types";
const TABLE_NAME = 'customers'

export const useCustomers = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const toast = useToast();

  const customerList = ref<Customer[]>([]);

  const loadingStates = reactive({
    save: false,
    delete: false,
    fetch: false,
  });

  const fetchCustomers = async (state = false) => {
    loadingStates.fetch = state;
    let { data, error } = await supabase
      .from(`${TABLE_NAME}`)
      .select("*")
      .eq("merchant_id", user.value?.id)
      .order("name");
    loadingStates.fetch = false;
    //set a deleting state on each customer
    customerList.value = data as Customer[];

    customerList.value?.map((customer: Customer) => ({
      ...customer,
      deleting: false,
    }));

    if (error) {
      return toast.add({
        title: "Error Fetching Customer List",
        description:
          "There was an error fetching your customer list. Please try again later.",
        icon: "i-heroicons-exclamation-circle",
        color: "red",
      });
    }
  };

  const updateCustomer = async ({
    data,
    id,
  }: {
    data: Partial<Customer>;
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
        title: "Error Updating Customer",
        description:
          "There was an error updating the customer. Please try again later.",
        icon: "i-heroicons-exclamation-circle",
        color: "red",
      });
    }
    fetchCustomers();
    toast.add({
      title: "Customer Updated Successfully!",
      icon: "i-heroicons-check-badge-solid",
    });
  };

  const createCustomer = async ({ data }: { data: Partial<Customer> }) => {
    loadingStates.save = true;
    const { data: response, error } = await supabase
      .from(`${TABLE_NAME}`)
      .insert(data)
      .select();
    loadingStates.save = false;
    if (error) {
      toast.add({
        title: "Error While Adding Customer",
        description:
          "There was an error while adding the customer information. Please try again later.",
        icon: "i-heroicons-exclamation-circle",
        color: "red",
      });
      return null;
    }
    fetchCustomers();
    toast.add({
      title: "Customer Created Successfully!",
      icon: "i-heroicons-check-badge-solid",
    });
    return data[0];
  };

  const deleteCustomer = async (id: string) => {
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
          "There was an error deleting the selected customer. Please try again later.",
        icon: "i-heroicons-exclamation-circle",
        color: "red",
      });
    }
    fetchCustomers();
    toast.add({
      title: "Customer deleted successfully!",
      icon: "i-heroicons-check-badge-solid",
    });
  };

  return {
    fetchCustomers,
    updateCustomer,
    createCustomer,
    customerList,
    deleteCustomer,
  };
};
