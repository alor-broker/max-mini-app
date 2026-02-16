export interface MarketExchange {
  exchange: string;
  settings: ExchangeSettings;
}

export interface ExchangeSettings {
  isDefault?: boolean;
}

export interface CurrencySettings {
  // Exchange from which you can request exchange rates
  defaultCurrencyExchange: string;

  // Base currency against which conversion to other currencies occurs.
  baseCurrency: string;

  // Currency has different symbols. This field is used to map currency to instrument
  // Should contain record for base currency
  portfolioCurrencies: PortfolioCurrency[];
}

export interface PortfolioCurrency {
  positionSymbol: string;
  // Instrument to select when this currency in selected in blotter
  exchangeInstrument: {
    symbol: string;
    exchange?: string;
  } | null;
}

export interface MarketSettings {
  exchanges: MarketExchange[];
  currencies: CurrencySettings;
}
