export interface InvestmentIdeasFilters {
  strategyId?: number;
  symbol?: string;
  valid?: boolean;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
  pagination?: boolean;
  orderBy?: string;
}

export interface InvestmentIdea {
  comment: string;
  position: number;
  price: number;
  shares: number;
  signalId: number;
  size: number;
  stopLoss: number;
  strategyId: number;
  symbol: string;
  takeProfit: number;
  timestamp: Date;
  type: string
  userId: number;
  validTo: Date | null;
}

export interface InvestmentIdeaAuthor {
  avatar: string;
  comments: string;
  firstName: string;
  fullName: string;
  lastName: string;
  userId: number;
}
