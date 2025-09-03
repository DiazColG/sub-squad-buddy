import { useState, useEffect } from 'react';

export interface ExchangeRates {
  [key: string]: number;
}

export const useCurrencyExchange = () => {
  const [rates, setRates] = useState<ExchangeRates>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchExchangeRates = async () => {
    try {
      setLoading(true);
      
      // Using exchangerate-api.com free tier (1500 requests/month)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      
      const data = await response.json();
      setRates(data.rates);
      setLastUpdated(new Date());
      
      // Cache rates in localStorage with timestamp
      localStorage.setItem('exchangeRates', JSON.stringify({
        rates: data.rates,
        timestamp: Date.now()
      }));
      
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      
      // Try to load from cache if API fails
      const cached = localStorage.getItem('exchangeRates');
      if (cached) {
        const { rates: cachedRates, timestamp } = JSON.parse(cached);
        const isStale = Date.now() - timestamp > 24 * 60 * 60 * 1000; // 24 hours
        
        if (!isStale) {
          setRates(cachedRates);
          setLastUpdated(new Date(timestamp));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check cache first
    const cached = localStorage.getItem('exchangeRates');
    if (cached) {
      const { rates: cachedRates, timestamp } = JSON.parse(cached);
      const isStale = Date.now() - timestamp > 4 * 60 * 60 * 1000; // 4 hours
      
      if (!isStale) {
        setRates(cachedRates);
        setLastUpdated(new Date(timestamp));
        setLoading(false);
        return;
      }
    }
    
    // Fetch fresh rates
    fetchExchangeRates();
  }, []);

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return amount;
    
    if (!rates[fromCurrency] || !rates[toCurrency]) {
      console.warn(`Exchange rate not found for ${fromCurrency} or ${toCurrency}`);
      return amount;
    }
    
    // Convert through USD base
    const usdAmount = fromCurrency === 'USD' ? amount : amount / rates[fromCurrency];
    const convertedAmount = toCurrency === 'USD' ? usdAmount : usdAmount * rates[toCurrency];
    
    return convertedAmount;
  };

  const formatCurrency = (amount: number, currency: string): string => {
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
    
    // For numbers >= 1000: no decimals, use "." as thousands separator
    // For numbers < 1000: show decimals if necessary
    const formatted = amount >= 1000 
      ? new Intl.NumberFormat('es-ES', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(Math.round(amount))
      : new Intl.NumberFormat('es-ES', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(amount);

    return `${symbol}${formatted} ${currency}`;
  };

  return {
    rates,
    loading,
    lastUpdated,
    convertCurrency,
    formatCurrency,
    refreshRates: fetchExchangeRates
  };
};