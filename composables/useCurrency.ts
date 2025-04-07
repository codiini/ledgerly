import { ref } from 'vue'

/**
 * Array of supported currencies with their details
 * @type {Array<{name: string, code: string, symbol: string, locale: string}>}
 */
export const currencies = [
  { name: "US Dollar", code: "USD", symbol: "$", locale: "en-US" },
  { name: "Euro", code: "EUR", symbol: "€", locale: "de-DE" },
  { name: "British Pound", code: "GBP", symbol: "£", locale: "en-GB" },
  { name: "Japanese Yen", code: "JPY", symbol: "¥", locale: "ja-JP" },
  { name: "Canadian Dollar", code: "CAD", symbol: "CA$", locale: "en-CA" },
  { name: "Australian Dollar", code: "AUD", symbol: "A$", locale: "en-AU" },
  { name: "Swiss Franc", code: "CHF", symbol: "CHF", locale: "fr-CH" },
  { name: "Chinese Yuan", code: "CNY", symbol: "¥", locale: "zh-CN" },
  { name: "Indian Rupee", code: "INR", symbol: "₹", locale: "hi-IN" },
  { name: "Brazilian Real", code: "BRL", symbol: "R$", locale: "pt-BR" },
  { name: "South African Rand", code: "ZAR", symbol: "R", locale: "en-ZA" },
  { name: "Nigerian Naira", code: "NGN", symbol: "₦", locale: "en-NG" },
  { name: "Kenyan Shilling", code: "KES", symbol: "KSh", locale: "en-KE" },
  { name: "Ghanaian Cedi", code: "GHS", symbol: "GH₵", locale: "en-GH" },
];


/**
 * Vue composable for handling currency formatting and settings
 * @returns {Object} Currency utility methods and reactive references
 * @property {Ref<string>} currencySymbol - The current currency symbol
 * @property {Ref<string>} currencyCode - The current currency code
 * @property {Function} formatCurrency - Format number to currency string
 * @property {Function} fetchCurrencySettings - Fetch user's currency preferences
 */
export const useCurrency = (): object => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const currencySymbol = ref('$')
  const currencyCode = ref('USD')


  /**
   * Fetches user's currency settings from Supabase
   * Updates currencySymbol and currencyCode refs with fetched values
   * @async
   * @returns {Promise<void>}
   */
  const fetchCurrencySettings = async () => {
    const { data } = await supabase
      .from('store_settings')
      .select('currency, currency_symbol')
      .eq('user_id', user.value?.id)
      .single()
    
    if (data) {
      currencySymbol.value = data.currency_symbol
      currencyCode.value = data.currency
    }
  }

  /**
   * Formats a number into a localized currency string
   * @param {number | bigint} amount - The amount to format
   * @param {string} currency - The currency code to use for formatting
   * @returns {string} Formatted currency string
   * @example
   * formatCurrency(1000, 'USD') // Returns "$1,000.00"
   * formatCurrency(1000, 'EUR') // Returns "€1,000.00"
   */
   const formatCurrency = (amount:  number | bigint, currency: string): string => {
    const profileSettingLocale = currencies.find((c) => c.code === currency)?.locale ?? 'en-US';
    const currencyLocale = currencies.find((c) => c.code === currencyCode.value)?.locale ?? 'en-US';
    return new Intl.NumberFormat(
      currency?.length > 0 ? profileSettingLocale : currencyLocale,
      {
      style: 'currency',
      currency: currency ? currency : currencyCode.value,
      currencyDisplay: 'narrowSymbol',
      currencySign: 'accounting',
    }).format(amount);
  };
  
  onMounted(() => fetchCurrencySettings())
  
  return {
    currencySymbol,
    currencyCode,
    formatCurrency,
    fetchCurrencySettings
  }
}