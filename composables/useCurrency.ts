import { ref } from 'vue'

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


export const useCurrency = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const currencySymbol = ref('$')
  const currencyCode = ref('USD')

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


   const formatCurrency = (amount:  number | bigint, currency: string) => {
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