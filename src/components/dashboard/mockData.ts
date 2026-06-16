import { LiveScannerResult, StockDetailsResponse, RiskState, SimulatedTrade } from "./types";

export const MOCK_SCANNER_RESULTS: Record<string, Omit<LiveScannerResult, "symbol">> = {
  "RELIANCE.NS": {
    action: "BUY",
    close: 2450.50,
    score: 0.88,
    confidence: 0.85,
    strategy: "VWAP_TREND_CONTINUATION",
    entry_zone: [2445.00, 2455.00],
    stop_loss: 2420.00,
    target_1: 2515.00,
    target_2: 2540.00,
    position_size: 40,
    risk_per_trade: 1220.00,
    reasons: [
      "RSI at 62.5 indicates strong upward momentum.",
      "Price crossed above session VWAP with expanding volume.",
      "Volume is 2.1x relative to 20-day average."
    ]
  },
  "TCS.NS": {
    action: "SELL",
    close: 3820.00,
    score: 0.74,
    confidence: 0.70,
    strategy: "MEAN_REVERSION",
    entry_zone: [3815.00, 3830.00],
    stop_loss: 3875.00,
    target_1: 3740.00,
    target_2: 3700.00,
    position_size: 25,
    risk_per_trade: 1375.00,
    reasons: [
      "Double top pattern detected at 3880 resistance.",
      "Relative volume is 1.8x, signaling active distribution.",
      "RSI is in overbought zone (74.2)."
    ]
  },
  "INFY.NS": {
    action: "HOLD",
    close: 1480.00,
    score: 0.52,
    confidence: 0.55,
    strategy: "RANGE_BOUND",
    entry_zone: [1475.00, 1485.00],
    stop_loss: 1450.00,
    target_1: 1515.00,
    target_2: 1535.00,
    position_size: 0,
    risk_per_trade: 0,
    reasons: [
      "Trading inside a tight sideways range (1470-1490).",
      "Relative volume is extremely thin (0.6x average).",
      "RSI is neutral at 50.5."
    ]
  },
  "HDFCBANK.NS": {
    action: "BUY",
    close: 1620.00,
    score: 0.92,
    confidence: 0.90,
    strategy: "BREAKOUT",
    entry_zone: [1615.00, 1625.00],
    stop_loss: 1595.00,
    target_1: 1665.00,
    target_2: 1690.00,
    position_size: 40,
    risk_per_trade: 1000.00,
    reasons: [
      "Consolidation breakout on high volume.",
      "Favorable sector rotation into banking.",
      "Relative volume is 2.4x average, showing heavy buying."
    ]
  },
  "ICICIBANK.NS": {
    action: "BUY",
    close: 1120.00,
    score: 0.68,
    confidence: 0.72,
    strategy: "MA_CROSSOVER",
    entry_zone: [1115.00, 1125.00],
    stop_loss: 1098.00,
    target_1: 1150.00,
    target_2: 1170.00,
    position_size: 45,
    risk_per_trade: 990.00,
    reasons: [
      "9-EMA crossed above 21-EMA on 15-minute chart.",
      "RSI rising from 45 to 58, indicating expanding momentum."
    ]
  },
  "SBIN.NS": {
    action: "SELL",
    close: 830.00,
    score: 0.81,
    confidence: 0.78,
    strategy: "VWAP_BREAKDOWN",
    entry_zone: [827.00, 833.00],
    stop_loss: 845.00,
    target_1: 810.00,
    target_2: 795.00,
    position_size: 66,
    risk_per_trade: 990.00,
    reasons: [
      "Price closed below session VWAP on volume spike.",
      "Z-score is -1.8, indicating strong downward divergence."
    ]
  },
  "WIPRO.NS": {
    action: "SKIP",
    close: 460.00,
    score: 0.35,
    confidence: 0.40,
    strategy: "LOW_LIQUIDITY",
    entry_zone: [458.00, 462.00],
    stop_loss: 445.00,
    target_1: 475.00,
    target_2: 485.00,
    position_size: 0,
    risk_per_trade: 0,
    reasons: [
      "Relative volume is very low (0.4x average).",
      "Spread is too wide to support standard execution."
    ]
  },
  "BHARTIARTL.NS": {
    action: "BUY",
    close: 1380.00,
    score: 0.85,
    confidence: 0.80,
    strategy: "VWAP_TREND_CONTINUATION",
    entry_zone: [1375.00, 1385.00],
    stop_loss: 1360.00,
    target_1: 1415.00,
    target_2: 1435.00,
    position_size: 50,
    risk_per_trade: 1000.00,
    reasons: [
      "Pouncing off dynamic support at the 20-EMA.",
      "Institutional order flow is positive on telecommunications."
    ]
  },
  "ITC.NS": {
    action: "HOLD",
    close: 430.00,
    score: 0.48,
    confidence: 0.50,
    strategy: "RANGE_BOUND",
    entry_zone: [428.00, 432.00],
    stop_loss: 420.00,
    target_1: 442.00,
    target_2: 450.00,
    position_size: 0,
    risk_per_trade: 0,
    reasons: [
      "Low volatility consolidation ahead of FMCG sector indexing.",
      "Z-score close to 0."
    ]
  }
};

export const MOCK_STOCK_DETAILS: Record<string, StockDetailsResponse> = {
  "RELIANCE.NS": {
    symbol: "RELIANCE.NS",
    close: 2450.50,
    action: "BUY",
    volume: 3800000,
    avg_volume: 1800000,
    relative_volume: 2.1,
    liquidity_score: 0.98,
    atr: 42.80,
    rsi: 62.5,
    vwap: 2438.00,
    z_score: 1.45,
    reasons: [
      "RSI at 62.5 indicates strong upward momentum.",
      "Price crossed above session VWAP with expanding volume.",
      "Volume is 2.1x relative to 20-day average."
    ]
  },
  "TCS.NS": {
    symbol: "TCS.NS",
    close: 3820.00,
    action: "SELL",
    volume: 1440000,
    avg_volume: 800000,
    relative_volume: 1.8,
    liquidity_score: 0.96,
    atr: 58.50,
    rsi: 74.2,
    vwap: 3845.00,
    z_score: 2.10,
    reasons: [
      "Double top pattern detected at 3880 resistance.",
      "Relative volume is 1.8x, signaling active distribution.",
      "RSI is in overbought zone (74.2)."
    ]
  },
  "INFY.NS": {
    symbol: "INFY.NS",
    close: 1480.00,
    action: "HOLD",
    volume: 600000,
    avg_volume: 1000000,
    relative_volume: 0.6,
    liquidity_score: 0.92,
    atr: 22.30,
    rsi: 50.5,
    vwap: 1481.20,
    z_score: -0.15,
    reasons: [
      "Trading inside a tight sideways range (1470-1490).",
      "Relative volume is extremely thin (0.6x average).",
      "RSI is neutral at 50.5."
    ]
  },
  "HDFCBANK.NS": {
    symbol: "HDFCBANK.NS",
    close: 1620.00,
    action: "BUY",
    volume: 9600000,
    avg_volume: 4000000,
    relative_volume: 2.4,
    liquidity_score: 0.99,
    atr: 28.40,
    rsi: 68.2,
    vwap: 1608.50,
    z_score: 1.95,
    reasons: [
      "Consolidation breakout on high volume.",
      "Favorable sector rotation into banking.",
      "Relative volume is 2.4x average, showing heavy buying."
    ]
  },
  "ICICIBANK.NS": {
    symbol: "ICICIBANK.NS",
    close: 1120.00,
    action: "BUY",
    volume: 3200000,
    avg_volume: 2600000,
    relative_volume: 1.2,
    liquidity_score: 0.97,
    atr: 18.50,
    rsi: 58.0,
    vwap: 1116.40,
    z_score: 0.85,
    reasons: [
      "9-EMA crossed above 21-EMA on 15-minute chart.",
      "RSI rising from 45 to 58, indicating expanding momentum."
    ]
  },
  "SBIN.NS": {
    symbol: "SBIN.NS",
    close: 830.00,
    action: "SELL",
    volume: 6800000,
    avg_volume: 4200000,
    relative_volume: 1.6,
    liquidity_score: 0.95,
    atr: 16.20,
    rsi: 28.5,
    vwap: 836.80,
    z_score: -1.80,
    reasons: [
      "Price closed below session VWAP on volume spike.",
      "Z-score is -1.8, indicating strong downward divergence."
    ]
  },
  "WIPRO.NS": {
    symbol: "WIPRO.NS",
    close: 460.00,
    action: "SKIP",
    volume: 400000,
    avg_volume: 1000000,
    relative_volume: 0.4,
    liquidity_score: 0.88,
    atr: 9.80,
    rsi: 38.0,
    vwap: 461.50,
    z_score: -0.95,
    reasons: [
      "Relative volume is very low (0.4x average).",
      "Spread is too wide to support standard execution."
    ]
  },
  "BHARTIARTL.NS": {
    symbol: "BHARTIARTL.NS",
    close: 1380.00,
    action: "BUY",
    volume: 2900000,
    avg_volume: 1800000,
    relative_volume: 1.6,
    liquidity_score: 0.94,
    atr: 24.50,
    rsi: 61.2,
    vwap: 1374.00,
    z_score: 1.15,
    reasons: [
      "Pouncing off dynamic support at the 20-EMA.",
      "Institutional order flow is positive on telecommunications."
    ]
  },
  "ITC.NS": {
    symbol: "ITC.NS",
    close: 430.00,
    action: "HOLD",
    volume: 1100000,
    avg_volume: 2000000,
    relative_volume: 0.55,
    liquidity_score: 0.93,
    atr: 7.20,
    rsi: 48.8,
    vwap: 430.50,
    z_score: -0.05,
    reasons: [
      "Low volatility consolidation ahead of FMCG sector indexing.",
      "Z-score close to 0."
    ]
  }
};

export const generateMockStockDetails = (symbol: string): StockDetailsResponse => {
  if (MOCK_STOCK_DETAILS[symbol]) return MOCK_STOCK_DETAILS[symbol];
  return {
    symbol,
    close: 1000.0,
    action: "HOLD",
    volume: 1000000,
    avg_volume: 1000000,
    relative_volume: 1.0,
    liquidity_score: 0.90,
    atr: 15.0,
    rsi: 50.0,
    vwap: 1000.0,
    z_score: 0.0,
    reasons: ["Neutral indicator readings.", "Average relative volume and liquidity."]
  };
};

export const MOCK_RISK: RiskState = {
  date: new Date().toISOString().split("T")[0],
  realized_pnl_today: 4250.00,
  realized_pnl_week: 12890.00,
  realized_pnl_month: 38400.00,
  open_risk: 2595.00,
  kill_switch_active: false,
  max_concurrent_positions_limit: 5,
  account_equity: 100000.00
};

export const MOCK_TRADES: SimulatedTrade[] = [
  {
    symbol: "RELIANCE.NS",
    entry_time: "2026-06-12 10:15",
    entry_price: 2435.00,
    stop_loss: 2410.00,
    target: 2485.00,
    exit_time: "2026-06-12 14:30",
    exit_price: 2485.00,
    pnl: 2000.00,
    outcome: "WIN"
  },
  {
    symbol: "RELIANCE.NS",
    entry_time: "2026-06-13 09:30",
    entry_price: 2460.00,
    stop_loss: 2445.00,
    target: 2490.00,
    exit_time: "2026-06-13 11:15",
    exit_price: 2445.00,
    pnl: -600.00,
    outcome: "LOSS"
  },
  {
    symbol: "TCS.NS",
    entry_time: "2026-06-14 13:00",
    entry_price: 3850.00,
    stop_loss: 3880.00,
    target: 3790.00,
    exit_time: "2026-06-14 15:10",
    exit_price: 3790.00,
    pnl: 2400.00,
    outcome: "WIN"
  }
];

export const MOCK_DISCLAIMER = "Disclaimer: Rationale provided by Gemini AI and Quantitative agents is for educational purposes only. Trading stocks involves substantial risk of loss. SEBI Registered Research Analyst registration pending.";
