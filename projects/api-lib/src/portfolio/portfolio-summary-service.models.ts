export enum ClientType {
  StandardRisk = 'StandardRisk',
  HighRisk = 'HighRisk',
  Special = 'Special'
}

export interface PortfolioSummary {
  buyingPowerAtMorning: number;
  buyingPower: number;
  profit: number;
  profitRate: number;
  portfolioEvaluation: number;
  portfolioLiquidationValue: number;
  initialMargin: number;
  riskBeforeForcePositionClosing: number;
  commission: number;
  buyingPowerByCurrency: [
    {
      currency: string;
      buyingPower: number;
    }
  ]
}

export interface PortfolioRisks {
  portfolio: string;
  exchange: string;
  portfolioEvaluation: number;
  portfolioLiquidationValue: number;
  initialMargin: number;
  minimalMargin: number;
  correctedMargin: number;
  riskCoverageRatioOne: number;
  riskCoverageRatioTwo: number;
  riskCategoryId: number;
  clientType: ClientType;
  hasForbiddenPositions: boolean;
  hasNegativeQuantity: boolean;
}

export interface PortfolioFortsRisks {
  portfolio: string;
  moneyFree: number;
  moneyBlocked: number;
  fee: number;
  moneyOld: number;
  moneyAmount: number;
  moneyPledgeAmount: number;
  vmInterCl: number;
  vmCurrentPositions: number;
  varMargin: number;
  isLimitsSet: boolean;
}
