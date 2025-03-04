const user = useSupabaseUser()

export default function useUser() { 

    const userInitials = computed(() => {
        if (!user.value?.email) return "?";
        return user.value.email.substring(0, 2).toUpperCase();
      });

      const userFirstName = computed(() => user.value?.user_metadata.firstName);


    return {
        userInitials,
        userFirstName
    }
}