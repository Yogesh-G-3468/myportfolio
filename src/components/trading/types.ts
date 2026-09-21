// ── Trading Types ────────────────────────────────────────────────────────────

export interface MarketDataRequest {
  symbols: string[];
  start_date?: string;
  end_date?: string;
  interval?: string;
}

export interface MarketDataPoint {
  Date: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
}

export interface MarketDataSymbol {
  data: MarketDataPoint[];
  rows: number;
}

export interface MarketDataResponse {
  success: boolean;
  symbols: string[];
  data: Record<string, MarketDataSymbol>;
}

export interface AISignalRequest {
  symbol: string;
  timeframe?: string;
  context?: string;
}

export interface AISignalResponse {
  symbol: string;
  signal: "buy" | "sell" | "hold";
  confidence: number;
  reasoning: string;
  suggested_entry: number | null;
  suggested_stop_loss: number | null;
  suggested_take_profit: number | null;
  risk_reward_ratio: number | null;
  timestamp: string;
}

export type OrderSide = "buy" | "sell";
export type OrderType = "market" | "limit" | "stop" | "stop_limit";
export type OrderStatus = "pending" | "submitted" | "filled" | "partially_filled" | "cancelled" | "rejected";

export interface OrderRequest {
  symbol: string;
  side: OrderSide;
  order_type?: OrderType;
  quantity: number;
  price?: number;
  stop_price?: number;
  reason?: string;
}

export interface Order {
  id: number;
  symbol: string;
  side: string;
  order_type: string;
  quantity: number;
  price: number | null;
  status: string;
  broker_order_id: string | null;
  created_at: string;
}

export interface Position {
  id: number;
  symbol: string;
  side: string;
  quantity: number;
  entry_price: number;
  current_price: number | null;
  unrealized_pnl: number;
  stop_loss: number | null;
  take_profit: number | null;
  is_open: boolean;
  opened_at: string;
}

export interface BacktestRequest {
  strategy_name: string;
  symbols: string[];
  start_date: string;
  end_date: string;
  initial_capital?: number;
  parameters?: Record<string, unknown>;
}

export interface BacktestResult {
  id: number;
  strategy_name: string;
  symbols: string[];
  start_date: string;
  end_date: string;
  initial_capital: number;
  final_capital: number;
  total_return: number;
  sharpe_ratio: number | null;
  max_drawdown: number | null;
  win_rate: number | null;
  total_trades: number;
  winning_trades?: number;
  losing_trades?: number;
  avg_win?: number;
  avg_loss?: number;
  parameters: Record<string, unknown> | null;
  metrics: Record<string, unknown> | null;
  created_at: string;
}

export interface PortfolioSummary {
  total_value: number;
  cash_balance: number;
  positions_value: number;
  total_pnl: number;
  total_pnl_pct: number;
  open_positions: number;
  daily_pnl: number;
  winning_positions: number;
  losing_positions: number;
}

export interface TradingHealth {
  status: string;
  service: string;
  broker: string;
  llm_provider: string;
  llm_configured: boolean;
  trading_universe: string[];
  risk_per_trade: string;
  max_positions: number;
}

// ── Watchlist / Stock Screener ────────────────────────────────────────────

export interface WatchlistRequest {
  universe: string[];
  max_results?: number;
  min_price?: number;
  max_price?: number;
  min_dollar_volume?: number;
}

export interface KeyLevels {
  resistance_1: number | null;
  resistance_2: number | null;
  support_1: number | null;
  support_2: number | null;
  pivot: number | null;
}

export interface FactorScores {
  volume_explosion: number;
  trend_alignment: number;
  momentum: number;
  rsi_sweet_spot: number;
  bollinger_squeeze: number;
  liquidity: number;
}

export interface WatchlistItem {
  symbol: string;
  price: number;
  change_pct: number;
  volume: number;
  dollar_volume: number;
  composite_score: number;
  factor_scores: FactorScores;
  reasons: string[];
  suggested_direction: "LONG" | "SHORT" | "WATCH_BOUNCE" | "WATCH_REVERSAL" | "NEUTRAL";
  key_levels: KeyLevels;
}

export interface WatchlistResponse {
  timestamp: string;
  total_scanned: number;
  shortlisted: number;
  watchlist: WatchlistItem[];
}

export interface MarketOpeningScanResponse {
  timestamp: string;
  total_scanned: number;
  shortlisted: number;
  gap_plays: WatchlistItem[];
  momentum_plays: WatchlistItem[];
  reversal_plays: WatchlistItem[];
  full_watchlist: WatchlistItem[];
  market_notes: string;
}

// Pre-built stock universes
export const STOCK_UNIVERSES: Record<string, string[]> = {
  "US Tech": ["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA", "META", "AMZN", "AMD", "NFLX", "CRM", "ADBE", "INTC", "ORCL", "IBM", "CSCO"],
  "US Blue Chip": ["AAPL", "MSFT", "JPM", "JNJ", "WMT", "PG", "V", "UNH", "HD", "DIS", "BAC", "MA", "XOM", "KO", "PEP"],
  "Nifty 50": ["RELIANCE.NS", "HDFCBANK.NS", "INFY.NS", "TCS.NS", "ICICIBANK.NS", "HINDUNILVR.NS", "SBIN.NS", "BHARTIARTL.NS", "ITC.NS", "KOTAKBANK.NS", "LT.NS", "BAJFINANCE.NS", "ASIANPAINT.NS", "MARUTI.NS", "SUNPHARMA.NS"],
  "Semiconductors": ["NVDA", "AMD", "INTC", "QCOM", "AVGO", "TXN", "MU", "AMAT", "LRCX", "ASML"],
  "EV & Clean Energy": ["TSLA", "RIVN", "LCID", "NIO", "XPEV", "FSLR", "ENPH", "SEDG", "PLUG", "CSIQ"],
};

// Pre-built strategy templates
export interface StrategyTemplate {
  name: string;
  description: string;
  defaultParams: Record<string, unknown>;
}

export const STRATEGY_TEMPLATES: StrategyTemplate[] = [
  {
    name: "Buy and Hold",
    description: "Equal-weight buy and hold across selected symbols. Classic passive benchmark.",
    defaultParams: {},
  },
  {
    name: "Moving Average Crossover",
    description: "Buy when short MA crosses above long MA, sell when it crosses below.",
    defaultParams: { fast_ma: 10, slow_ma: 50 },
  },
  {
    name: "RSI Mean Reversion",
    description: "Buy when RSI indicates oversold (<30), sell when overbought (>70).",
    defaultParams: { rsi_period: 14, oversold: 30, overbought: 70 },
  },
  {
    name: "Bollinger Bounce",
    description: "Buy near lower band, sell near upper band using 20-period Bollinger Bands.",
    defaultParams: { period: 20, std_dev: 2 },
  },
];