import { ref } from 'vue'

export const useFormatCurrency = () => {
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

   const formatCurrency = (amount:  number | bigint, currency = 'USD') => {
    return new Intl.NumberFormat(navigator.languages, {
      style: 'currency',
      currency: currencyCode.value ?? currency,
      currencyDisplay: 'narrowSymbol',
      currencySign: 'accounting',
    }).format(amount);
  };
  
  fetchCurrencySettings()
  
  return {
    currencySymbol,
    currencyCode,
    formatCurrency,
    fetchCurrencySettings
  }
}