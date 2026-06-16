import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  Loader2,
  Play,
  XCircle,
  CheckCircle2,
  Clock,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { BacktestResult, formatCurrency } from "./types";

interface BacktestSandboxProps {
  handleRunBacktest: (e: React.FormEvent) => void;
  backtestUniverse: string;
  setBacktestUniverse: (val: string) => void;
  backtestInterval: string;
  setBacktestInterval: (val: string) => void;
  backtestPeriod: string;
  setBacktestPeriod: (val: string) => void;
  backtestRiskPct: number;
  setBacktestRiskPct: (val: number) => void;
  backtestLoading: boolean;
  backtestStatus: string | null;
  backtestError: string | null;
  backtestResults: BacktestResult | null;
  backtestExpanded: boolean;
  setBacktestExpanded: (val: boolean) => void;
}

export const BacktestSandbox: React.FC<BacktestSandboxProps> = ({
  handleRunBacktest,
  backtestUniverse,
  setBacktestUniverse,
  backtestInterval,
  setBacktestInterval,
  backtestPeriod,
  setBacktestPeriod,
  backtestRiskPct,
  setBacktestRiskPct,
  backtestLoading,
  backtestStatus,
  backtestError,
  backtestResults,
  backtestExpanded,
  setBacktestExpanded
}) => {
  return (
    <section className="flex flex-col h-full">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <Database size={14} className="text-purple-500" />
        Backtesting Simulation Lab
      </h2>

      <div className="flex-1 bg-slate-900/20 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 flex flex-col shadow-xl">
        
        {/* Submit Form */}
        <form onSubmit={handleRunBacktest} className="space-y-4 mb-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Target Ticker Symbols
            </label>
            <input
              type="text"
              required
              placeholder="e.g. RELIANCE.NS, TCS.NS"
              value={backtestUniverse}
              onChange={(e) => setBacktestUniverse(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-xs"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {["RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "SBIN.NS", "WIPRO.NS", "BHARTIARTL.NS", "ITC.NS"].map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => setBacktestUniverse(sym)}
                  className="px-2 py-0.5 text-[9px] font-bold bg-slate-950 hover:bg-slate-905 border border-slate-850 hover:border-purple-500/40 rounded text-slate-400 hover:text-purple-400 transition-all cursor-pointer"
                >
                  {sym.replace(".NS", "")}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Interval
              </label>
              <select
                value={backtestInterval}
                onChange={(e) => setBacktestInterval(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 transition-all text-xs cursor-pointer"
              >
                <option value="5m">5m Candle</option>
                <option value="15m">15m Candle</option>
                <option value="1h">1h Candle</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Simulation Period
              </label>
              <select
                value={backtestPeriod}
                onChange={(e) => setBacktestPeriod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 transition-all text-xs cursor-pointer"
              >
                <option value="5d">5 Days</option>
                <option value="1mo">1 Month</option>
                <option value="1y">1 Year</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              <span>Per-Trade Risk Ratio</span>
              <span className="text-purple-400">{(backtestRiskPct * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.005"
              max="0.05"
              step="0.005"
              value={backtestRiskPct}
              onChange={(e) => setBacktestRiskPct(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={backtestLoading}
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] transition-all rounded-lg font-bold text-xs tracking-wide text-white shadow-lg shadow-purple-500/15 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {backtestLoading ? (
              <>
                <Loader2 size={14} className="animate-spin text-white" />
                Simulation Active... ({backtestStatus})
              </>
            ) : (
              <>
                <Play size={14} />
                Run Backtest Simulation
              </>
            )}
          </button>
        </form>

        {/* Simulation Output Area */}
        <div className="flex-1 flex flex-col justify-center border-t border-slate-800/80 pt-4">
          {backtestError && (
            <div className="flex items-start gap-2 text-rose-500 text-xs bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 mb-4">
              <XCircle size={14} className="shrink-0 mt-0.5" />
              <span>{backtestError}</span>
            </div>
          )}

          {backtestLoading && !backtestResults && (
            <div className="text-center py-10 flex flex-col items-center">
              <div className="relative w-12 h-12 mb-3">
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
                <div className="absolute inset-0 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
              </div>
              <span className="text-xs font-semibold text-slate-300">
                {backtestStatus === "SUBMITTING"
                  ? "Generating Job Request..."
                  : backtestStatus === "PENDING"
                  ? "Queued in Backtest Broker..."
                  : "Simulating trades against historical feeds..."}
              </span>
              <p className="text-[10px] text-slate-500 mt-1">
                Do not refresh this window. Live updates stream automatically.
              </p>
            </div>
          )}

          {!backtestResults && !backtestError && !backtestLoading && (
            <div className="text-center py-10 flex flex-col items-center justify-center text-slate-500">
              <Database size={24} className="text-slate-600 mb-2" />
              <span className="text-xs font-semibold text-slate-400">Simulation Console Idle</span>
              <p className="text-[10px] text-slate-600 max-w-xs mt-1">
                Select ticker universe and click Run to calculate statistics, drawdown, and win ratios.
              </p>
            </div>
          )}

          {/* Backtest Results Dashboard */}
          {backtestResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  Simulation Results
                </h3>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 size={10} /> Completed
                </span>
              </div>

              {/* Score metrics & Dial */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <div className="flex items-center justify-center p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        className="stroke-slate-850"
                        strokeWidth="5"
                        fill="transparent"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        className="stroke-purple-500 transition-all duration-1000 ease-out"
                        strokeWidth="5"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 32}
                        strokeDashoffset={2 * Math.PI * 32 * (1 - backtestResults.win_rate)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-sm font-black text-white leading-none">
                        {Math.round(backtestResults.win_rate * 100)}%
                      </span>
                      <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold mt-0.5">
                        Win Rate
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/60 flex justify-between">
                    <span className="text-slate-500 font-medium">Net PnL:</span>
                    <strong className={`font-bold tabular-nums ${
                      backtestResults.net_pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}>
                      {backtestResults.net_pnl >= 0 ? "+" : ""}{formatCurrency(backtestResults.net_pnl)}
                    </strong>
                  </div>
                  
                  <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/60 flex justify-between">
                    <span className="text-slate-500 font-medium">Trades Executed:</span>
                    <strong className="text-slate-200 tabular-nums">{backtestResults.total_trades}</strong>
                  </div>

                  <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/60 flex justify-between">
                    <span className="text-slate-500 font-medium">Win/Loss:</span>
                    <strong className="text-slate-200 tabular-nums">
                      {backtestResults.winning_trades} / {backtestResults.total_trades - backtestResults.winning_trades}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Collapsible logs table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <div
                  onClick={() => setBacktestExpanded(!backtestExpanded)}
                  className="bg-slate-950/80 p-3 flex justify-between items-center cursor-pointer hover:bg-slate-900 transition-colors"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={12} className="text-purple-400" />
                    Simulated Order Ledger
                  </span>
                  <button type="button" className="text-slate-500">
                    {backtestExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                <AnimatePresence>
                  {backtestExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-x-auto max-h-48 border-t border-slate-850"
                    >
                      <table className="w-full text-[10px] text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-950 text-slate-500 uppercase tracking-wider border-b border-slate-850">
                            <th className="p-2 font-semibold">Asset</th>
                            <th className="p-2 font-semibold">Entry / Exit</th>
                            <th className="p-2 font-semibold">SL / Target</th>
                            <th className="p-2 font-semibold text-right">PnL</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.keys(backtestResults.trades_by_symbol).map((symbol) => {
                            const trades = backtestResults.trades_by_symbol[symbol] || [];
                            if (trades.length === 0) return null;
                            
                            return trades.map((trade, idx) => {
                              const isWin = trade.outcome === "WIN";
                              return (
                                <tr
                                  key={`${symbol}-${idx}`}
                                  className="border-b border-slate-900/60 hover:bg-slate-900/30 transition-colors text-slate-300"
                                >
                                  <td className="p-2 font-bold whitespace-nowrap text-white">
                                    {symbol}
                                  </td>
                                  <td className="p-2 leading-relaxed">
                                    <span className="block tabular-nums">In: {formatCurrency(trade.entry_price)}</span>
                                    <span className="block text-[8px] text-slate-500">{trade.entry_time}</span>
                                    <span className="block tabular-nums">Out: {formatCurrency(trade.exit_price)}</span>
                                    <span className="block text-[8px] text-slate-500">{trade.exit_time}</span>
                                  </td>
                                  <td className="p-2 leading-relaxed">
                                    <span className="block text-[9px] text-rose-500/80 tabular-nums">SL: {formatCurrency(trade.stop_loss)}</span>
                                    <span className="block text-[9px] text-emerald-500/80 tabular-nums">TGT: {formatCurrency(trade.target)}</span>
                                  </td>
                                  <td className={`p-2 text-right font-semibold tabular-nums whitespace-nowrap ${
                                    isWin ? "text-emerald-400" : "text-rose-400"
                                  }`}>
                                    <span className="block">{isWin ? "+" : ""}{formatCurrency(trade.pnl)}</span>
                                    <span className={`inline-block text-[8px] px-1 py-0.2 rounded font-black mt-0.5 ${
                                      isWin ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                                    }`}>
                                      {trade.outcome}
                                    </span>
                                  </td>
                                </tr>
                              );
                            });
                          })}
                        </tbody>
                      </table>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </motion.div>
          )}
        </div>

      </div>
    </section>
  );
};
