/**
 * Vue composable for managing user-related computations and data
 * @returns {Object} User utility methods and computed properties
 * @property {ComputedRef<string>} userInitials - Computed user initials from email
 * @property {ComputedRef<string>} userFirstName - Computed user's first name from metadata
 */
export default function useUser(): object { 
    const user = useSupabaseUser();

    /**
     * Computes user initials from email address
     * @returns {string} Two character uppercase initials or "?" if no email
     */
    const userInitials = computed(() => {
        if (!user.value?.email) return "?";
        return user.value.email.substring(0, 2).toUpperCase();
    });

    /**
     * Computes user's first name from user metadata
     * Handles both camelCase and lowercase metadata field names
     * @returns {string|undefined} User's first name if available
     */
    const userFirstName = computed(() => user.value?.user_metadata.firstName ?? user.value?.user_metadata.firstname);

    return {
        userInitials,
        userFirstName
    }
}