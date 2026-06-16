import React from "react";
import { Loader2, SlidersHorizontal, ArrowUpRight, Eye, Activity, Info } from "lucide-react";
import { LiveScannerResponse, LiveScannerResult, formatCurrency } from "./types";

interface WatchlistScannerProps {
  liveData: LiveScannerResponse | null;
  handleSelectStock: (symbol: string) => void;
}

export const WatchlistScanner: React.FC<WatchlistScannerProps> = ({
  liveData,
  handleSelectStock
}) => {
  // Gracefully fallback to signals array or empty array if results is undefined
  const results: any[] = liveData?.results || (liveData as any)?.signals || [];

  return (
    <section className="lg:col-span-2 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
          <Activity size={14} className="text-cyan-500" />
          Live Intraday Watchlist Scanner
        </h2>
        <span className="text-[10px] text-slate-500 font-medium bg-slate-900 px-2 py-0.5 border border-slate-800 rounded">
          {results.length} assets qualified
        </span>
      </div>

      <div className="flex-1 bg-slate-900/20 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col shadow-xl justify-start overflow-hidden">
        {!liveData ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
            <Loader2 size={36} className="text-cyan-500 animate-spin mb-4" />
            <h3 className="font-bold text-slate-400 text-sm">Awaiting scanner pipeline response</h3>
            <p className="text-xs text-slate-600 max-w-xs mt-1">
              Connecting to FastAPI live scanner stream. Please ensure endpoint services are running.
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
            <SlidersHorizontal size={36} className="text-slate-600 mb-4 animate-pulse" />
            <h3 className="font-bold text-slate-400 text-sm">No scanner results match criteria</h3>
            <p className="text-xs text-slate-600 max-w-xs mt-1">
              Try lowering the Minimum Score slider or shifting direction filters to expand scanning universe.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-950/60 text-slate-500 uppercase tracking-wider border-b border-slate-850">
                  <th className="p-3 font-bold">Symbol</th>
                  <th className="p-3 font-bold text-center">Action State</th>
                  <th className="p-3 font-bold">Strategy</th>
                  <th className="p-3 font-bold text-center">Score / Conf</th>
                  <th className="p-3 font-bold text-right">Close Price</th>
                  <th className="p-3 font-bold text-center">Entry Zone</th>
                  <th className="p-3 font-bold text-center">SL / Targets</th>
                  <th className="p-3 font-bold text-right">Rec. Sizing</th>
                  <th className="p-3 font-bold text-center">Analyze</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row) => {
                  // Advanced outcome state badge mapping
                  const signalState = row.signal_state || row.action;
                  const actionColors = {
                    BUY_CANDIDATE: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
                    BUY: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
                    SELL_CANDIDATE: "text-rose-400 bg-rose-500/10 border-rose-500/25",
                    SELL: "text-rose-400 bg-rose-500/10 border-rose-500/25",
                    BLOCKED_BY_RISK: "text-amber-400 bg-amber-500/10 border-amber-550/30",
                    HOLD: "text-slate-400 bg-slate-800/50 border-slate-700/40",
                    SKIP: "text-slate-500 bg-slate-950/30 border-slate-900"
                  }[signalState as string] || "text-slate-400 bg-slate-800/50 border-slate-700/40";

                  const actionLabel = {
                    BUY_CANDIDATE: "BUY CANDIDATE",
                    BUY: "BUY",
                    SELL_CANDIDATE: "SELL CANDIDATE",
                    SELL: "SELL",
                    BLOCKED_BY_RISK: "BLOCKED BY RISK",
                    HOLD: "HOLD",
                    SKIP: "SKIP"
                  }[signalState as string] || signalState;

                  const isActive = row.action === "BUY" || row.action === "SELL";

                  // Fallbacks for older API models
                  const closePrice = row.close !== undefined ? row.close : (row.entry || 0);
                  const scoreDisplay = row.score !== undefined ? `${Math.round(row.score * 100)}%` : "N/A";
                  const confidenceDisplay = row.confidence !== undefined ? `${Math.round(row.confidence * 100)}%` : "N/A";
                  const strategyDisplay = (row.strategy || "Unknown").replace(/_/g, " ");

                  const entryZoneStr = row.entry_zone
                    ? `${formatCurrency(row.entry_zone[0])} - ${formatCurrency(row.entry_zone[1])}`
                    : row.entry
                    ? formatCurrency(row.entry)
                    : "N/A";

                  const stopLoss = row.stop_loss || 0;
                  const target1 = row.target_1 !== undefined ? row.target_1 : (row.target || 0);
                  const target2 = row.target_2 || null;

                  return (
                    <tr
                      key={row.symbol}
                      onClick={() => handleSelectStock(row.symbol)}
                      className="border-b border-slate-900/50 hover:bg-slate-900/20 transition-all duration-150 cursor-pointer group"
                    >
                      <td className="p-3 font-black text-white group-hover:text-cyan-400 transition-colors">
                        <div className="flex items-center gap-1.5">
                          <span>{row.symbol}</span>
                          <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <span className={`inline-block px-2 py-0.5 rounded font-black text-[10px] uppercase border ${actionColors}`}>
                            {actionLabel}
                          </span>
                          
                          {/* analysis_state badge */}
                          {row.analysis_state === "FILTERED_OUT" && (
                            <span className="block mt-1 text-[8px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1 py-0.2 rounded uppercase tracking-wider font-bold">
                              Low Liquidity
                            </span>
                          )}
                          {row.analysis_state === "FEATURE_ERROR" && (
                            <span className="block mt-1 text-[8px] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1 py-0.2 rounded uppercase tracking-wider font-bold">
                              Data Error
                            </span>
                          )}

                          {/* trade_state badge */}
                          {row.trade_state && row.trade_state !== "NOT_CREATED" && (
                            <span className={`block mt-1 text-[8px] px-1 py-0.2 rounded uppercase tracking-wider font-bold ${
                              row.trade_state === "OPEN" 
                                ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20" 
                                : "text-slate-500 bg-slate-950/30 border border-slate-900"
                            }`}>
                              {row.trade_state}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3 font-medium text-slate-300">
                        {strategyDisplay}
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-cyan-400 font-bold">{scoreDisplay}</span>
                          <span className="text-slate-500 text-[10px]">/</span>
                          <span className="text-slate-400">{confidenceDisplay}</span>
                        </div>
                      </td>

                      <td className="p-3 text-right font-bold tabular-nums text-slate-200">
                        {formatCurrency(closePrice)}
                      </td>

                      <td className="p-3 text-center font-medium tabular-nums text-slate-400">
                        {entryZoneStr}
                      </td>

                      <td className="p-3 text-center">
                        {isActive ? (
                          <div className="flex flex-col items-center gap-0.5 text-[10px] leading-tight">
                            <span className="text-rose-400">SL: {formatCurrency(stopLoss)}</span>
                            <span className="text-emerald-400">T1: {formatCurrency(target1)}</span>
                            {target2 && <span className="text-emerald-500">T2: {formatCurrency(target2)}</span>}
                          </div>
                        ) : (
                          <span className="text-slate-600 font-medium">N/A</span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        {isActive && row.position_size ? (
                          <div className="flex flex-col items-end text-right text-[10px] leading-tight relative group/tooltip">
                            <div className="flex items-center gap-1">
                              <span className="text-slate-200 font-bold">{row.position_size} Shares</span>
                              <Info size={11} className="text-slate-500 hover:text-cyan-400 transition-colors cursor-help" />
                            </div>
                            <span className="text-slate-400">Cash: {formatCurrency(row.risk_per_trade)}</span>
                            
                            {/* Hover tooltip for friction */}
                            {row.total_entry_costs !== undefined && (
                              <div className="absolute right-0 bottom-full mb-1.5 hidden group-hover/tooltip:flex flex-col bg-slate-950 border border-slate-800 rounded-xl p-3 shadow-2xl text-[10px] text-left w-52 z-30 space-y-1 backdrop-blur-md">
                                <span className="font-bold text-slate-300 border-b border-slate-850 pb-1 mb-1 block">Entry Cost Friction</span>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Slippage:</span>
                                  <span className="font-bold text-slate-300">{formatCurrency(row.entry_slippage || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Brokerage:</span>
                                  <span className="font-bold text-slate-300">{formatCurrency(row.entry_brokerage || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Taxes:</span>
                                  <span className="font-bold text-slate-300">{formatCurrency(row.entry_taxes || 0)}</span>
                                </div>
                                <div className="flex justify-between border-t border-slate-850 pt-1 mt-1 font-bold">
                                  <span className="text-cyan-400">Total Fee:</span>
                                  <span className="text-cyan-400">{formatCurrency(row.total_entry_costs || 0)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-600 font-medium">N/A</span>
                        )}
                      </td>

                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleSelectStock(row.symbol)}
                          className="p-1 hover:text-cyan-400 text-slate-500 rounded hover:bg-slate-800/80 transition-all cursor-pointer"
                          title="Analyze Technical Metrics"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
