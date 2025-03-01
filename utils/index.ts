export const formatCurrency = (amount:  number | bigint, locale = 'de-DE', currency = 'EUR') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };