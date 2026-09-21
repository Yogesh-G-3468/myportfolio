# Vibe Trading — AI-Powered Trading Dashboard

This directory integrates the **Vibe Trading** dashboard into your portfolio frontend, connecting to the Stratos FastAPI backend for AI-powered trading signals, portfolio management, and strategy backtesting.

## Architecture

```
Stratos Backend (FastAPI)                 Portfolio Frontend (Next.js)
┌────────────────────────────┐            ┌────────────────────────────────┐
│  /api/trading/*            │ ◄── JWT ── │  /trading                      │
│                            │            │                                │
│  • /market-data            │            │  Signals Tab  → AI buy/sell    │
│  • /signals/ai             │            │  Orders Tab   → create/list     │
│  • /orders                 │            │  Positions Tab → open P&L      │
│  • /positions              │            │  Backtest Tab → run/view       │
│  • /backtest               │            │  Portfolio Tab → summary       │
│  • /portfolio              │            │                                │
│  • /health                 │            │  Same JWT token shared across  │
│                            │            │  all dashboard features        │
└────────────────────────────┘            └────────────────────────────────┘
```

## Files Added

| File | Purpose |
|------|---------|
| `src/components/trading/types.ts` | TypeScript types for all trading data structures |
| `src/components/trading/api.ts` | API client functions calling Stratos backend |
| `src/app/trading/page.tsx` | Full trading dashboard with 5 tabs |
| `TRADING_README.md` | This guide |

## Files Modified

| File | Change |
|------|--------|
| `src/lib/data.ts` | Added "Vibe Trading" nav link |
| `src/components/Navbar.tsx` | Added `/trading` to wide-page layout |

## Prerequisites

1. **Stratos backend running** with the Vibe-Trading integration endpoints
2. **JWT credentials** for your Stratos instance (same as other dashboard features)
3. **Node.js 18+** and npm installed

## Getting Started

### 1. Install Dependencies (if not already)

```bash
cd frontend_temp
npm install
```

### 2. Configure Backend URL

Edit `next.config.ts` or set the environment variable:

```bash
export BACKEND_URL="https://stratos.yogeshwaran.space"
# OR for local development:
export BACKEND_URL="http://localhost:8000"
```

The frontend already proxies requests through `/api/proxy` (configured in `src/components/dashboard/api.ts`), so make sure your Next.js proxy config forwards to the Stratos backend.

### 3. Start the Development Server

```bash
npm run dev
```

### 4. Open the Trading Dashboard

Navigate to **http://localhost:3000/trading**

You'll see a login screen — use the same Stratos JWT credentials you use for other dashboard features (Resume Tailor, Career Scraper, etc.).

## Dashboard Tabs

### 🔮 AI Signals
Generate AI-powered buy/sell/hold signals for any stock symbol.

- Enter a symbol (e.g., `AAPL`, `GOOGL`, `RELIANCE.NS`)
- Click **Analyze** or press Enter
- See the signal with confidence score, reasoning, and suggested price levels
- Quick-select buttons for popular symbols
- Shows entry price, stop loss, take profit, and risk/reward ratio

### 📊 Orders
Create and track trading orders.

- **New Order**: Place market or limit orders
- **Orders Table**: View all orders with status (pending/submitted/filled/rejected)
- Refresh to see latest status
- Buy orders in green, sell orders in red

### 🎯 Positions
Monitor open trading positions and P&L.

- See entry price, current price, unrealized P&L
- Stop loss levels
- Win/loss ratio summary
- Total portfolio P&L at a glance

### 📈 Backtest
Run strategy backtests on historical data.

- Choose from 4 built-in strategies:
  - **Buy and Hold** — Classic passive benchmark
  - **Moving Average Crossover** — Trade on MA crossovers
  - **RSI Mean Reversion** — Buy oversold, sell overbought
  - **Bollinger Bounce** — Trade band reversions
- Configure symbols, date range, initial capital
- View results: total return, Sharpe ratio, max drawdown, win rate

### 💰 Portfolio
Complete portfolio overview.

- Total value, P&L, daily change
- Cash vs invested allocation breakdown
- Win/loss ratio across all positions

## API Endpoints Used

The frontend calls these Stratos backend endpoints:

```
POST   /api/trading/market-data     — Fetch OHLCV data
POST   /api/trading/signals/ai      — Generate AI signal
POST   /api/trading/orders          — Create order
GET    /api/trading/orders          — List orders
GET    /api/trading/orders/{id}      — Get order
GET    /api/trading/positions       — List positions
GET    /api/trading/positions/{sym} — Get position
POST   /api/trading/backtest        — Run backtest
GET    /api/trading/backtest        — List backtests
GET    /api/trading/portfolio       — Portfolio summary
GET    /api/trading/health          — Health check
```

All endpoints require JWT authentication (same token as other Stratos features).

## Authentication Flow

1. User enters Stratos username/password on the trading login screen
2. Frontend calls `POST /auth/login` on the Stratos backend
3. JWT token is stored in `localStorage` as `stratos_jwt_token`
4. All subsequent API calls include `Authorization: Bearer <token>`
5. Token is shared across all dashboard features (Career Scraper, Resume Tailor, Trading)
6. If the token expires, user is prompted to re-authenticate

## Tech Stack

- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling (uses portfolio's existing theme)
- **Framer Motion** for animations
- **Lucide React** for icons

## Customization

### Adding a New Strategy

1. Add the strategy to `STRATEGY_TEMPLATES` in `src/components/trading/types.ts`:
```typescript
{
  name: "My Custom Strategy",
  description: "Description of what it does",
  defaultParams: { param1: value1 },
}
```

2. Implement the strategy in `app/services/trading/vibe_client.py` in the Stratos backend.

### Changing Default Symbols

Edit the `quickSymbols` array in `src/app/trading/page.tsx` (line ~340):
```typescript
const quickSymbols = ["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA", "RELIANCE.NS"];
```

### Changing the Backend URL

The trading dashboard uses the same backend URL as other features, configured in `src/components/dashboard/api.ts`. Set `BACKEND_URL` in your environment or `next.config.ts`.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Failed to fetch" | Make sure Stratos backend is running and accessible |
| "Session expired" | Re-enter your Stratos credentials |
| AI signals show no confidence | Set `ANTHROPIC_API_KEY` in your Stratos `.env` for LLM-enhanced signals |
| No market data | Check internet connection — data comes from Yahoo Finance |
| Backtest returns empty | Verify the date range has trading days and symbols are valid |

## Security Notes

- All trading is in **paper mode** by default — no real money is traded
- JWT tokens are stored in `localStorage` (same as other dashboard features)
- Set `VIBE_TRADING_BROKER` to a real broker only when you're ready for live trading
- Never commit `.env` files with API keys