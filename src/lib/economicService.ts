export interface EconomicIndicator {
  period_month: string;
  inflation_rate: number;
  accumulated_inflation: number;
  usd_official_rate: number;
  usd_blue_rate: number;
  purchasing_power_index: number;
  data_source: string;
}

export interface InstallmentAnalysis {
  installment_id: string;
  period_month: string;
  nominal_amount: number;
  real_amount: number;
  usd_amount: number;
  inflation_rate: number;
  usd_exchange_rate: number;
  purchasing_power_index: number;
}

export interface EconomicAnalysisResult {
  totalLiquefaction: number;
  averageInflationImpact: number;
  usdSavings: number;
  bestPaymentStrategy: 'early' | 'on_time' | 'delayed';
  projectedSavings: number;
}

class EconomicService {
  private baseInflationIndex = 100; // Base 100 for January 2024

  /**
   * Calculate the real value of an installment adjusted for inflation
   */
  calculateRealValue(
    nominalAmount: number, 
    purchaseDate: string, 
    paymentDate: string,
    indicators: EconomicIndicator[]
  ): number {
    const purchasePeriod = this.dateToYearMonth(purchaseDate);
    const paymentPeriod = this.dateToYearMonth(paymentDate);
    
    const purchaseIndicator = indicators.find(i => i.period_month === purchasePeriod);
    const paymentIndicator = indicators.find(i => i.period_month === paymentPeriod);
    
    if (!purchaseIndicator || !paymentIndicator) {
      return nominalAmount; // If no data, return nominal
    }
    
    // Calculate cumulative inflation from purchase to payment
    const inflationMultiplier = paymentIndicator.purchasing_power_index / purchaseIndicator.purchasing_power_index;
    
    return nominalAmount * inflationMultiplier;
  }

  /**
   * Convert installment amount to USD at historical rate
   */
  calculateUSDValue(
    nominalAmount: number,
    paymentDate: string,
    indicators: EconomicIndicator[],
    useBlueRate = true
  ): number {
    const paymentPeriod = this.dateToYearMonth(paymentDate);
    const indicator = indicators.find(i => i.period_month === paymentPeriod);
    
    if (!indicator) return 0;
    
    const exchangeRate = useBlueRate ? indicator.usd_blue_rate : indicator.usd_official_rate;
    return nominalAmount / exchangeRate;
  }

  /**
   * Calculate liquefaction percentage (how much the installment "melted" due to inflation)
   */
  calculateLiquefaction(
    nominalAmount: number,
    purchaseDate: string,
    paymentDate: string,
    indicators: EconomicIndicator[]
  ): number {
    const realValue = this.calculateRealValue(nominalAmount, purchaseDate, paymentDate, indicators);
    return ((realValue - nominalAmount) / nominalAmount) * 100;
  }

  /**
   * Analyze complete installment plan
   */
  analyzeInstallmentPlan(
    totalAmount: number,
    installmentAmount: number,
    totalInstallments: number,
    purchaseDate: string,
    firstPaymentDate: string,
    indicators: EconomicIndicator[]
  ): EconomicAnalysisResult {
    let totalNominal = 0;
    let totalReal = 0;
    let totalUSD = 0;
    const analyses: InstallmentAnalysis[] = [];

    // Calculate for each installment
    for (let i = 0; i < totalInstallments; i++) {
      const paymentDate = this.addMonths(firstPaymentDate, i);
      const period = this.dateToYearMonth(paymentDate);
      
      const realAmount = this.calculateRealValue(installmentAmount, purchaseDate, paymentDate, indicators);
      const usdAmount = this.calculateUSDValue(installmentAmount, paymentDate, indicators);
      
      const indicator = indicators.find(ind => ind.period_month === period);
      
      totalNominal += installmentAmount;
      totalReal += realAmount;
      totalUSD += usdAmount;
      
      analyses.push({
        installment_id: '', // Will be set when saving to DB
        period_month: period,
        nominal_amount: installmentAmount,
        real_amount: realAmount,
        usd_amount: usdAmount,
        inflation_rate: indicator?.inflation_rate || 0,
        usd_exchange_rate: indicator?.usd_blue_rate || 0,
        purchasing_power_index: indicator?.purchasing_power_index || 100
      });
    }

    // Calculate metrics
    const totalLiquefaction = ((totalReal - totalNominal) / totalNominal) * 100;
    const averageInflationImpact = totalLiquefaction / totalInstallments;
    const usdSavings = totalUSD;
    
    // Determine best strategy
    const earlyPaymentSavings = this.calculateEarlyPaymentSavings(totalAmount, purchaseDate, indicators);
    const bestPaymentStrategy = earlyPaymentSavings > 0 ? 'early' : 'delayed';
    
    return {
      totalLiquefaction,
      averageInflationImpact,
      usdSavings,
      bestPaymentStrategy,
      projectedSavings: Math.abs(earlyPaymentSavings)
    };
  }

  /**
   * Calculate savings from paying early vs installments
   */
  private calculateEarlyPaymentSavings(
    totalAmount: number,
    purchaseDate: string,
    indicators: EconomicIndicator[]
  ): number {
    const currentPeriod = this.dateToYearMonth(new Date().toISOString());
    const purchasePeriod = this.dateToYearMonth(purchaseDate);
    
    const currentIndicator = indicators.find(i => i.period_month === currentPeriod);
    const purchaseIndicator = indicators.find(i => i.period_month === purchasePeriod);
    
    if (!currentIndicator || !purchaseIndicator) return 0;
    
    // What the total amount would be worth today in real terms
    const realTotalValue = totalAmount * (currentIndicator.purchasing_power_index / purchaseIndicator.purchasing_power_index);
    
    return totalAmount - realTotalValue;
  }

  /**
   * Generate future projections
   */
  projectFuturePayments(
    remainingInstallments: number,
    installmentAmount: number,
    nextPaymentDate: string,
    averageInflationRate = 2.0 // Monthly percentage
  ): Array<{ month: string; nominal: number; projected_real: number; liquefaction: number }> {
    const projections = [];
    let currentDate = nextPaymentDate;
    let accumulatedInflation = 1;

    for (let i = 0; i < remainingInstallments; i++) {
      accumulatedInflation *= (1 + averageInflationRate / 100);
      const projectedRealValue = installmentAmount * accumulatedInflation;
      const liquefaction = ((projectedRealValue - installmentAmount) / installmentAmount) * 100;

      projections.push({
        month: this.dateToYearMonth(currentDate),
        nominal: installmentAmount,
        projected_real: projectedRealValue,
        liquefaction
      });

      currentDate = this.addMonths(currentDate, 1);
    }

    return projections;
  }

  /**
   * Get comparative analysis with different currencies
   */
  getCurrencyComparison(
    amount: number,
    fromDate: string,
    toDate: string,
    indicators: EconomicIndicator[]
  ) {
    const fromPeriod = this.dateToYearMonth(fromDate);
    const toPeriod = this.dateToYearMonth(toDate);
    
    const fromIndicator = indicators.find(i => i.period_month === fromPeriod);
    const toIndicator = indicators.find(i => i.period_month === toPeriod);
    
    if (!fromIndicator || !toIndicator) return null;
    
    return {
      ars_nominal: amount,
      ars_real: amount * (toIndicator.purchasing_power_index / fromIndicator.purchasing_power_index),
      usd_official_from: amount / fromIndicator.usd_official_rate,
      usd_official_to: amount / toIndicator.usd_official_rate,
      usd_blue_from: amount / fromIndicator.usd_blue_rate,
      usd_blue_to: amount / toIndicator.usd_blue_rate,
      inflation_impact: ((toIndicator.purchasing_power_index / fromIndicator.purchasing_power_index - 1) * 100),
      usd_official_variation: ((toIndicator.usd_official_rate / fromIndicator.usd_official_rate - 1) * 100),
      usd_blue_variation: ((toIndicator.usd_blue_rate / fromIndicator.usd_blue_rate - 1) * 100)
    };
  }

  /**
   * Get economic indicators from database
   */
  async getEconomicIndicators(): Promise<EconomicIndicator[]> {
    try {
      // For now, return mock data. In production, this would fetch from Supabase
      const mockIndicators: EconomicIndicator[] = [
        {
          period_month: '2024-01',
          inflation_rate: 20.6,
          accumulated_inflation: 20.6,
          usd_official_rate: 835.0,
          usd_blue_rate: 1050.0,
          purchasing_power_index: 100.0,
          data_source: 'manual'
        },
        {
          period_month: '2024-09',
          inflation_rate: 3.5,
          accumulated_inflation: 101.6,
          usd_official_rate: 985.0,
          usd_blue_rate: 1315.0,
          purchasing_power_index: 59.9,
          data_source: 'manual'
        },
        {
          period_month: '2025-09',
          inflation_rate: 1.3,
          accumulated_inflation: 127.8,
          usd_official_rate: 1165.0,
          usd_blue_rate: 1255.0,
          purchasing_power_index: 47.6,
          data_source: 'manual'
        }
      ];

      return mockIndicators;
    } catch (error) {
      console.error('Error fetching economic indicators:', error);
      return [];
    }
  }

  /**
   * Utility methods
   */
  dateToYearMonth(dateString: string): string {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  addMonths(dateString: string, months: number): string {
    const date = new Date(dateString);
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  }
}

export const economicService = new EconomicService();