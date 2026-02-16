import { apiClient } from "./client";
import { setRefreshToken, setAccessToken, clearTokens, getRefreshToken } from "./token-manager";
import { API_CONFIG } from "./config";

// --- Enums and Models ---

export enum Side {
  Buy = 'buy',
  Sell = 'sell'
}

export enum OrderType {
  Market = 'market',
  Limit = 'limit',
  StopMarket = 'stop',
  StopLimit = 'stoplimit'
}

export enum OrderStatus {
  Working = 'working',
  Filled = 'filled',
  Canceled = 'canceled',
  Rejected = 'rejected'
}

export interface User {
  clientId: string;
  login: string;
}

export interface RefreshJwtTokenResponse {
  jwt: string;
  refreshExpiresAt: string;
}

interface JwtBody {
  exp: number;
  portfolios: string;
  clientid: string;
  ein: string;
  agreements: string;
  sub: string;
}

export interface ClientPortfolio {
  portfolio: string;
  tks: string;
  market: string;
  agreement: string;
  exchange: string;
}

export interface PortfolioSummary {
  buyingPowerAtMorning: number;
  buyingPower: number;
  profit: number;
  profitRate: number;
  portfolioLiquidationValue: number;
}

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

export interface PortfolioPosition {
  symbol: string;
  brokerSymbol: string;
  exchange: string;
  shortName: string;
  portfolio: string;
  volume: number;
  avgPrice: number;
  qtyUnits: number;
  dailyUnrealisedPl: number;
  unrealisedPl: number;
  isCurrency: boolean;
}

export interface PortfolioTrade {
  id: string;
  orderNo: string;
  symbol: string;
  exchange: string;
  date: Date;
  qty: number;
  price: number;
  side: Side;
  volume: number;
}

export interface PortfolioOrder {
  id: string;
  symbol: string;
  exchange: string;
  portfolio: string;
  type: OrderType;
  side: Side;
  status: OrderStatus;
  transTime: Date;
  endTime: Date;
  qtyUnits: number;
  filledQtyUnits: number;
  price: number;
}

export interface InstrumentKey {
  symbol: string;
  exchange: string;
  board?: string | null;
  ISIN?: string;
}

export interface Instrument extends InstrumentKey {
  shortname: string;
  description: string;
  primary_board: string;
  minstep: number;
  lotsize?: number;
  pricestep?: number;
}

export interface SearchFilter {
  query: string;
  limit: number;
  exchange?: string;
}

export interface NewOrder {
  side: Side;
  instrument: InstrumentKey;
  quantity: number;
}

export interface NewMarketOrder extends NewOrder { }

export interface NewLimitOrder extends NewOrder {
  price: number;
}

export interface NewOrderResponse {
  message: string;
  orderNumber: string;
}

// --- Helper Functions ---
const decodeJwtBody = (jwt: string): JwtBody => {
  try {
    const mainPart = jwt.split('.')[1];
    const decodedString = atob(mainPart);
    return JSON.parse(decodedString) as JwtBody;
  } catch (e) {
    console.error("Failed to decode JWT", e);
    throw new Error("Invalid Token");
  }
};

const getBaseOrdersUrl = (config: typeof API_CONFIG) => `${config.superAppUrl}/commandapi/warptrans/TRADE/v2/client/orders`;

const getOrderRequest = async <T extends NewOrder>(
  order: T,
  portfolio: string,
  config: typeof API_CONFIG,
  orderType: string
): Promise<NewOrderResponse> => {
  return apiClient.post<NewOrderResponse>(`${getBaseOrdersUrl(config)}/actions/${orderType}`, {
    ...order,
    user: { portfolio }
  }, {
    headers: {
      'X-REQID': crypto.randomUUID()
    }
  });
}


// --- AuthService ---
export const AuthService = {
  redirectToSso: (isExit: boolean = false) => {
    const callbackUrl = `${window.location.protocol}//${window.location.host}/auth`;
    const scope = 'MiniApp';
    const ssoUrl = `${API_CONFIG.ssoUrl}?url=${callbackUrl}&scope=${scope}${isExit ? '&exit=1' : ''}`;
    window.location.assign(ssoUrl);
  },

  refreshToken: async (token: string): Promise<{ user: User, jwt: string } | null> => {
    try {
      const response = await fetch(`${API_CONFIG.userDataUrl}/auth/actions/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: token, context: { skipAuthorization: true } })
      });

      if (!response.ok) {
        return null;
      }

      const data: RefreshJwtTokenResponse = await response.json();

      const jwtBody = decodeJwtBody(data.jwt);
      return {
        jwt: data.jwt,
        user: {
          clientId: jwtBody.clientid,
          login: jwtBody.sub
        }
      };
    } catch (error) {
      console.error("Failed to refresh token", error);
      return null;
    }
  }
};

export const UserService = {
  getUserFromToken: (token: string): User => {
    const jwtBody = decodeJwtBody(token);
    return {
      clientId: jwtBody.clientid,
      login: jwtBody.sub
    };
  }
};

// --- ClientService ---
export const ClientService = {
  getPortfolios: async (clientId: string): Promise<ClientPortfolio[]> => {
    const portfolios = await apiClient.get<Omit<ClientPortfolio, 'exchange'>[]>(`${API_CONFIG.userDataUrl}/client/v1.0/users/${clientId}/all-portfolios`);

    return portfolios.map(p => ({
      ...p,
      exchange: p.market === 'United' ? 'SPBX' : 'MOEX'
    }));
  }
};

// --- PortfolioService ---
export const PortfolioService = {
  getSummary: async (exchange: string, portfolio: string): Promise<PortfolioSummary> => {
    return apiClient.get<PortfolioSummary>(`${API_CONFIG.apiUrl}/md/v2/Clients/${exchange}/${portfolio}/summary`);
  },

  getPositions: async (exchange: string, portfolio: string): Promise<PortfolioPosition[]> => {
    return apiClient.get<PortfolioPosition[]>(`${API_CONFIG.apiUrl}/md/v2/Clients/${exchange}/${portfolio}/positions`);
  },

  getTrades: async (exchange: string, portfolio: string): Promise<PortfolioTrade[]> => {
    const trades = await apiClient.get<PortfolioTrade[]>(`${API_CONFIG.apiUrl}/md/v2/Clients/${exchange}/${portfolio}/trades`);
    return trades.map(t => ({ ...t, date: new Date(t.date) }));
  },

  getOrders: async (exchange: string, portfolio: string): Promise<PortfolioOrder[]> => {
    const orders = await apiClient.get<PortfolioOrder[]>(`${API_CONFIG.apiUrl}/md/v2/Clients/${exchange}/${portfolio}/orders`);
    return orders.map(o => ({
      ...o,
      transTime: new Date(o.transTime),
      endTime: new Date(o.endTime)
    }));
  }
};

// --- InstrumentsService ---
export const InstrumentsService = {
  searchInstruments: async (filters: SearchFilter): Promise<Instrument[]> => {
    const params = new URLSearchParams();
    params.append('query', filters.query);
    params.append('limit', String(filters.limit));
    if (filters.exchange) params.append('exchange', filters.exchange);

    const instruments = await apiClient.get<Instrument[]>(`${API_CONFIG.apiUrl}/md/v2/Securities?${params.toString()}&IncludeUnknownBoards=false`);
    return instruments.map(i => ({ ...i, board: i.board ?? i.primary_board, minstep: i.minstep ?? 0.01 }));
  },

  getInstrument: async (instrument: InstrumentKey): Promise<Instrument> => {
    const inst = await apiClient.get<Instrument>(`${API_CONFIG.apiUrl}/md/v2/Securities/${instrument.exchange}/${instrument.symbol}`);
    return { ...inst, board: inst.board ?? inst.primary_board, minstep: inst.minstep ?? 0.01 };
  }
}

// --- OrdersService ---
export const OrdersService = {
  submitLimitOrder: async (order: NewLimitOrder, portfolio: string): Promise<NewOrderResponse> => {
    return getOrderRequest(order, portfolio, API_CONFIG, 'limit');
  },

  submitMarketOrder: async (order: NewMarketOrder, portfolio: string): Promise<NewOrderResponse> => {
    return getOrderRequest(order, portfolio, API_CONFIG, 'market');
  }
}

// --- InvestmentIdeasService ---
export const InvestmentIdeasService = {
  getInvestmentIdeas: async (filters: InvestmentIdeasFilters = {}): Promise<InvestmentIdea[]> => {
    const params = new URLSearchParams();
    if (filters.orderBy) params.append('orderBy', filters.orderBy);
    if (filters.valid !== undefined) params.append('valid', String(filters.valid));

    const ideas = await apiClient.get<InvestmentIdea[]>(`${API_CONFIG.superAppUrl}/autofollow/signals?${params.toString()}`);

    return ideas.map(idea => ({
      ...idea,
      timestamp: new Date(idea.timestamp),
      validTo: idea.validTo ? new Date(idea.validTo) : null
    }));
  }
}
