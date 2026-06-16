export interface LiveScannerResult {
  symbol: string;
  action: "BUY" | "SELL" | "HOLD" | "SKIP";
  close: number;
  score: number;
  confidence: number;
  strategy: string;
  entry_zone: [number, number];
  stop_loss: number;
  target_1: number;
  target_2: number | null;
  position_size: number;
  risk_per_trade: number;
  reasons: string[];
  // New outcome states
  analysis_state?: "SCANNED" | "READY_FOR_SCORING" | "FILTERED_OUT" | "FEATURE_ERROR" | string;
  signal_state?: "BUY_CANDIDATE" | "SELL_CANDIDATE" | "BLOCKED_BY_RISK" | "SKIP" | string;
  trade_state?: "OPEN" | "CLOSED" | "NOT_CREATED" | "CANCELLED" | string;
  // Cost friction fields
  entry_slippage?: number;
  entry_brokerage?: number;
  entry_taxes?: number;
  total_entry_costs?: number;
  // AI Overlay debug fields
  ai_model_used?: string;
  base_score?: number;
  ai_score_adjustment?: number;
  ai_input_payload?: any;
  ai_output_payload?: any;
}

export interface LiveScannerResponse {
  scan_time: string;
  market_state: "OPEN" | "CLOSED" | "CUTOFF_PASSED";
  qualified_count: number;
  results: LiveScannerResult[];
}

export interface StockDetailsResponse {
  symbol: string;
  close: number;
  action: "BUY" | "SELL" | "HOLD" | "SKIP";
  volume: number;
  avg_volume: number;
  relative_volume: number;
  liquidity_score: number;
  atr: number;
  rsi: number;
  vwap: number;
  z_score: number;
  reasons: string[];
  // Extended technical indicators
  trend_strength?: number; // ADX rating 0-100
  execution_spread?: number; // Bid-ask spread in INR
  opening_range_status?: "INSIDE" | "BREAKOUT" | string;
  opening_gap_pct?: number; // Gap %
  // AI Overlay debug fields
  ai_model_used?: string;
  base_score?: number;
  ai_score_adjustment?: number;
  ai_input_payload?: any;
  ai_output_payload?: any;
}

export interface RiskState {
  date: string;
  realized_pnl_today: number;
  realized_pnl_week: number;
  realized_pnl_month: number;
  open_risk: number;
  kill_switch_active: boolean;
  max_concurrent_positions_limit: number;
  account_equity: number;
}

export interface SimulatedTrade {
  symbol: string;
  entry_time: string;
  entry_price: number;
  stop_loss: number;
  target: number;
  exit_time: string;
  exit_price: number;
  pnl: number;
  outcome: "WIN" | "LOSS";
  gross_pnl?: number;
  net_pnl?: number;
}

export interface BacktestResult {
  total_trades: number;
  winning_trades: number;
  win_rate: number;
  net_pnl: number;
  trades_by_symbol: Record<string, SimulatedTrade[]>;
}

export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(val);
};

export const getPnLColor = (val: number | undefined | null) => {
  if (val === undefined || val === null || val === 0) return "text-slate-400";
  return val > 0 
    ? "text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.15)]" 
    : "text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.15)]";
};

export const getPnLColorSimple = (val: number | undefined | null) => {
  if (val === undefined || val === null || val === 0) return "text-slate-400";
  return val > 0 ? "text-emerald-400" : "text-rose-400";
};

export const formatPnL = (val: number | undefined | null) => {
  if (val === undefined || val === null || val === 0) return "₹0.00";
  if (val > 0) return `+${formatCurrency(val)}`;
  return formatCurrency(val);
};
