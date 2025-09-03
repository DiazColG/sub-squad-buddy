/**
 * Formats numbers according to Spanish locale standards:
 * - Numbers >= 1000: no decimals, use "." as thousands separator
 * - Numbers < 1000: up to 2 decimals if needed
 * - Currency formatting with appropriate symbols
 */

export const formatNumber = (amount: number): string => {
  if (amount >= 1000) {
    // For numbers >= 1000: no decimals, use "." as thousands separator
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  } else {
    // For numbers < 1000: show decimals if necessary
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }
};

export const formatCurrency = (amount: number, currency: string): string => {
  const currencySymbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    ARS: '$',
    CAD: 'C$',
    MXN: '$',
    BRL: 'R$',
  };

  const symbol = currencySymbols[currency] || currency;
  const formattedAmount = formatNumber(amount);

  return `${symbol}${formattedAmount} ${currency}`;
};

export const formatPercentage = (value: number): string => {
  return `${Math.round(value * 100)}%`;
};