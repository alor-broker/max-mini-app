export interface PortfolioKey {
  portfolio: string;
  exchange: string;
}

export enum PortfolioMarket {
  Curr = 'CURR',
  Fond = 'FOND',
  Forts = 'FORTS',
  United = 'UNITED'
}

export interface Portfolio {
  portfolioKey: PortfolioKey;
  market: PortfolioMarket | null;
}
