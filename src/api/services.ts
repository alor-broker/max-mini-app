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

export interface HistoryItemData {
  order?: string;
  amount?: number;
  accountFrom?: string;
  accountTo?: string;
  subportfolioFrom?: string;
  subportfolioTo?: string;
  currency?: string;
  currencyExchange?: string;
  accountNumber?: string;
  orderType?: string;
  issuer?: string;
  price?: number;
  extCurrency?: string | null;
}

export type HistorySearchType = 'deal' | 'moneymove' | 'operation';
export type HistoryEndpoint = 'all' | 'operations';

export interface HistoryItem {
  id: string;
  type: 'moneymove' | 'operation' | string;
  date: string;
  status: string;
  statusName?: string;
  icon?: string;
  title?: string;
  subType?: string;
  sum?: number;
  currency?: string;
  data?: HistoryItemData;
  documents?: unknown[];
  files?: unknown[];
  refuseReason?: string | null;
  cancelling?: boolean;
  agreementId?: string;
}

export interface HistoryResponse {
  list: HistoryItem[];
  total?: number;
}

export interface HistoryFilters {
  endpoint?: HistoryEndpoint;
  limit?: number;
  offset?: number;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  search?: string;
  searchType?: HistorySearchType;
  loadDocuments?: boolean;
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
  currentVolume: number;
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

const getBaseOrdersUrl = (config: typeof API_CONFIG) => `${config.apiUrl}/commandapi/warptrans/TRADE/v2/client/orders`;

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
  },

  getActivePortfolios: async (clientId: string, login: string): Promise<ClientPortfolio[]> => {
    const [allPortfolios, allPositions] = await Promise.all([
      ClientService.getPortfolios(clientId),
      PortfolioService.getAllPositions(login)
    ]);

    // Filter portfolios that have at least one position with non-zero quantity
    const activePortfolios = allPortfolios.filter(portfolio =>
      allPositions.some(pos => pos.portfolio === portfolio.portfolio && pos.qtyUnits !== 0)
    );

    return activePortfolios;
  }
};

// --- PortfolioService ---
export const PortfolioService = {
  getSummary: async (exchange: string, portfolio: string): Promise<PortfolioSummary> => {
    return apiClient.get<PortfolioSummary>(`${API_CONFIG.apiUrl}/md/v2/Clients/${exchange}/${portfolio}/summary`);
  },

  getAllPositions: async (login: string): Promise<PortfolioPosition[]> => {
    return apiClient.get<PortfolioPosition[]>(`${API_CONFIG.apiUrl}/md/v2/clients/${login}/positions`);
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
export interface Quote {
  last_price: number;
  bid: number;
  ask: number;
  open_price: number;
  high_price: number;
  low_price: number;
  change: number;
  change_percent: number;
  last_price_timestamp?: number;
}

export interface HistoryBar {
  time?: number;
  t?: number;
  timestamp?: number;
  close?: number;
  c?: number;
}

export interface HistoryRequest {
  exchange: string;
  symbol: string;
  tf: string;
  from: number;
  to: number;
}


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
    return {
      ...inst,
      symbol: instrument.symbol,
      exchange: instrument.exchange,
      board: inst.board ?? inst.primary_board,
      minstep: inst.minstep ?? 0.01
    };
  },

  getQuotes: async (exchange: string, symbol: string): Promise<Quote | null> => {
    const quotes = await apiClient.get<Quote[]>(`${API_CONFIG.apiUrl}/md/v2/Securities/${exchange}:${symbol}/quotes`);
    return Array.isArray(quotes) && quotes.length > 0 ? quotes[0] : null;
  },

  getHistory: async (request: HistoryRequest): Promise<HistoryBar[]> => {
    const params = new URLSearchParams();
    params.append('exchange', request.exchange);
    params.append('symbol', request.symbol);
    params.append('tf', request.tf);
    params.append('from', String(request.from));
    params.append('to', String(request.to));

    const response = await apiClient.get<HistoryBar[] | { history?: HistoryBar[]; candles?: HistoryBar[] }>(
      `${API_CONFIG.apiUrl}/md/v2/history?${params.toString()}`
    );

    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response.history)) {
      return response.history;
    }

    if (Array.isArray(response.candles)) {
      return response.candles;
    }

    return [];
  },

  getInstruments: async (requests: InstrumentKey[]): Promise<Instrument[]> => {
    const promises = requests.map(req =>
      InstrumentsService.getInstrument(req)
        .catch(e => {
          console.error(`Failed to fetch instrument ${req.symbol}`, e);
          return null;
        })
    );

    const results = await Promise.all(promises);
    return results.filter((i): i is Instrument => i !== null);
  }
}

// --- OrdersService ---
export const OrdersService = {
  submitLimitOrder: async (order: NewLimitOrder, portfolio: string): Promise<NewOrderResponse> => {
    return getOrderRequest(order, portfolio, API_CONFIG, 'limit');
  },

  submitMarketOrder: async (order: NewMarketOrder, portfolio: string): Promise<NewOrderResponse> => {
    return getOrderRequest(order, portfolio, API_CONFIG, 'market');
  },

  cancelOrder: async (portfolio: string, orderId: string, exchange: string): Promise<void> => {
    // Alor API docs: DELETE /commandapi/warptrans/TRADE/v2/client/orders/{orderId}
    // But we might need params like exchange or portfolio in query or body?
    // Using simple DELETE based on provided link: https://alor.dev/docs/api/http/commandapi-warptrans-trade-v-2-client-orders-order-id-delete
    await apiClient.delete(`${API_CONFIG.apiUrl}/commandapi/warptrans/TRADE/v2/client/orders/${orderId}?portfolio=${portfolio}&exchange=${exchange}`);
  },

  cancelAllOrders: async (portfolio: string, exchange: string): Promise<void> => {
    // https://alor.dev/docs/api/http/commandapi-warptrans-trade-v-2-client-orders-all-delete
    // DELETE /commandapi/warptrans/TRADE/v2/client/orders/all?portfolio=...&exchange=...
    await apiClient.delete(`${API_CONFIG.apiUrl}/commandapi/warptrans/TRADE/v2/client/orders/all?portfolio=${portfolio}&exchange=${exchange}&stop=false`);
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

export const OperationsHistoryService = {
  getHistory: async (
    agreementId: string,
    filters: HistoryFilters = {}
  ): Promise<HistoryResponse> => {
    const endpoint = filters.endpoint ?? 'all';
    const params = new URLSearchParams();

    params.append('limit', String(filters.limit ?? 30));
    params.append('offset', String(filters.offset ?? 0));
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.searchType) params.append('searchType', filters.searchType);
    if (typeof filters.loadDocuments === 'boolean') {
      params.append('loadDocuments', String(filters.loadDocuments));
    }

    const raw = await apiClient.get<HistoryResponse | HistoryItem[]>(
      `${API_CONFIG.historyApiUrl}/client/v1.0/history/${agreementId}/${endpoint}?${params.toString()}`
    );

    if (Array.isArray(raw)) {
      return { list: raw, total: raw.length };
    }

    return {
      list: Array.isArray(raw?.list) ? raw.list : [],
      total: raw?.total
    };
  }
};
