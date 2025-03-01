export const formatCurrency = (amount:  number | bigint, locale = 'en-US', currency = 'EUR') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };