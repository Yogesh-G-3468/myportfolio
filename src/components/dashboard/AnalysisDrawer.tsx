import React from "react";
import { motion } from "framer-motion";
import { X, ShieldAlert, Sparkles, SlidersHorizontal, Newspaper } from "lucide-react";
import { StockDetailsResponse, formatCurrency, NewsSentimentItem } from "./types";

interface AnalysisDrawerProps {
  selectedStock: string;
  stockDetails: StockDetailsResponse | null;
  selectedStockNews: NewsSentimentItem | null;
  detailsLoading: boolean;
  detailsError: string | null;
  onClose: () => void;
}

export const AnalysisDrawer: React.FC<AnalysisDrawerProps> = ({
  selectedStock,
  stockDetails,
  selectedStockNews,
  detailsLoading,
  detailsError,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-[9999] flex justify-end">
      
      {/* Backdrop Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
      />

      {/* Slide-out Drawer content */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col z-10"
      >
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-black text-white">{selectedStock}</h2>
              {stockDetails && (
                <span className={`inline-block px-2.5 py-0.5 rounded font-black text-[10px] uppercase border ${
                  {
                    BUY: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
                    SELL: "text-rose-400 bg-rose-500/10 border-rose-500/25",
                    HOLD: "text-slate-400 bg-slate-800/50 border-slate-700/40",
                    SKIP: "text-slate-500 bg-slate-950/30 border-slate-900"
                  }[stockDetails.action] || "text-slate-400 bg-slate-800/50 border-slate-700/40"
                }`}>
                  {stockDetails.action}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">Real-time Technical & AI Copilot Scan Metrics</p>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 hover:text-white text-slate-500 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Loader State */}
          {detailsLoading && (
            <div className="space-y-6 animate-pulse">
              <div className="h-6 bg-slate-800 rounded w-1/3" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-28 bg-slate-800 rounded-2xl" />
                <div className="h-28 bg-slate-800 rounded-2xl" />
              </div>
              <div className="h-32 bg-slate-800 rounded-2xl" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-800 rounded w-1/4" />
                <div className="h-4 bg-slate-800 rounded w-full" />
                <div className="h-4 bg-slate-800 rounded w-5/6" />
              </div>
            </div>
          )}

          {/* Error State */}
          {detailsError && !selectedStockNews && (
            <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-300 text-xs flex items-center gap-2.5">
              <ShieldAlert size={16} className="text-rose-400 shrink-0" />
              <div>{detailsError}</div>
            </div>
          )}

          {/* Details Loaded */}
          {!detailsLoading && stockDetails && (() => {
            const indicators = stockDetails.indicators;
            const rsi = indicators?.rsi ?? indicators?.rsi_14 ?? stockDetails.rsi;
            const relativeVolume = indicators?.relative_volume ?? stockDetails.relative_volume;
            const zScore = indicators?.z_score ?? stockDetails.z_score;
            const volume = indicators?.volume ?? stockDetails.volume;
            const avgVolume = indicators?.avg_volume ?? stockDetails.avg_volume;
            const liquidity = indicators?.liquidity ?? indicators?.liquidity_score ?? stockDetails.liquidity_score;
            const spread = indicators?.spread ?? indicators?.bid_ask_spread ?? indicators?.spread_slippage_proxy ?? stockDetails.execution_spread;
            const openingRange = indicators?.opening_range ?? indicators?.opening_range_status ?? stockDetails.opening_range_status;
            const openingGap = indicators?.opening_gap ?? indicators?.gap_context ?? stockDetails.opening_gap_pct;

            return (
              <div className="space-y-6">
                
                {/* Price Overview Card */}
                <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Close Price</span>
                    <div className="text-2xl font-black text-slate-100 mt-1 tabular-nums">
                      {formatCurrency(stockDetails.close)}
                    </div>
                  </div>
                  {stockDetails.vwap && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Session VWAP</span>
                      <div className="text-sm font-bold text-slate-300 mt-1 tabular-nums">
                        {formatCurrency(stockDetails.vwap)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Main Signal Details Card */}
                <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-850/60 pb-3">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Strategy</span>
                      <span className="text-xs font-black text-cyan-400">
                        {stockDetails.strategy ? stockDetails.strategy.replace(/_/g, " ") : "N/A"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Signal State</span>
                      <span className={`inline-block px-2 py-0.5 rounded font-black text-[9px] uppercase border ${
                        {
                          BUY_CANDIDATE: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
                          SELL_CANDIDATE: "text-rose-400 bg-rose-500/10 border-rose-500/25",
                          BLOCKED_BY_RISK: "text-amber-400 bg-amber-500/10 border-amber-500/25",
                          HOLD: "text-slate-400 bg-slate-800/50 border-slate-700/40",
                          SKIP: "text-slate-500 bg-slate-950/30 border-slate-900"
                        }[stockDetails.signal_state || ""] || "text-slate-400 bg-slate-800/50 border-slate-700/40"
                      }`}>
                        {stockDetails.signal_state ? stockDetails.signal_state.replace(/_/g, " ") : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block mb-0.5">Composite Score</span>
                      <span className="text-base font-black text-slate-100 tabular-nums">
                        {stockDetails.score !== undefined && stockDetails.score !== null ? `${Math.round(stockDetails.score * 100)}%` : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Confidence</span>
                      <span className="text-base font-black text-slate-100 tabular-nums">
                        {stockDetails.confidence !== undefined && stockDetails.confidence !== null ? `${Math.round(stockDetails.confidence * 100)}%` : "N/A"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block mb-0.5">Trade State</span>
                      <span className={`inline-block px-1.5 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider ${
                        stockDetails.trade_state === "OPEN"
                          ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20"
                          : stockDetails.trade_state === "CLOSED"
                          ? "text-slate-400 bg-slate-800 border border-slate-750"
                          : "text-slate-500 bg-slate-950/50 border border-slate-900"
                      }`}>
                        {stockDetails.trade_state || "NOT CREATED"}
                      </span>
                    </div>
                  </div>

                  {/* Targets & Recommended Sizing - Render only if action is BUY or SELL or they exist */}
                  {(stockDetails.action === "BUY" || stockDetails.action === "SELL" || stockDetails.entry_zone || stockDetails.stop_loss) && (
                    <div className="border-t border-slate-850/60 pt-4 grid grid-cols-2 gap-4 text-xs">
                      {/* Targets Column */}
                      <div className="space-y-2 border-r border-slate-850/60 pr-4">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Target Parameters</span>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Entry Zone:</span>
                            <span className="font-bold text-slate-200 tabular-nums">
                              {stockDetails.entry_zone 
                                ? `${formatCurrency(stockDetails.entry_zone[0])} - ${formatCurrency(stockDetails.entry_zone[1])}`
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-rose-400">Stop Loss:</span>
                            <span className="font-bold text-rose-400 tabular-nums">
                              {stockDetails.stop_loss ? formatCurrency(stockDetails.stop_loss) : "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-emerald-400">Target 1:</span>
                            <span className="font-bold text-emerald-400 tabular-nums">
                              {stockDetails.target_1 ? formatCurrency(stockDetails.target_1) : "N/A"}
                            </span>
                          </div>
                          {stockDetails.target_2 && (
                            <div className="flex justify-between">
                              <span className="text-emerald-500">Target 2:</span>
                              <span className="font-bold text-emerald-500 tabular-nums">
                                {formatCurrency(stockDetails.target_2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Sizing Column */}
                      <div className="space-y-2 pl-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Recommended Sizing</span>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Position Size:</span>
                            <span className="font-bold text-slate-200 tabular-nums">
                              {stockDetails.position_size !== undefined && stockDetails.position_size !== null ? `${stockDetails.position_size} Shares` : "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Cash Risk:</span>
                            <span className="font-bold text-cyan-400 tabular-nums">
                              {stockDetails.risk_per_trade !== undefined && stockDetails.risk_per_trade !== null ? formatCurrency(stockDetails.risk_per_trade) : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Gauges Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* RSI Gauge */}
                  <div className="bg-slate-950/20 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">RSI (14)</span>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-2xl font-black text-slate-100 tabular-nums">
                        {rsi !== undefined && rsi !== null ? rsi.toFixed(1) : "N/A"}
                      </span>
                      {rsi !== undefined && rsi !== null && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                          rsi > 70
                            ? "bg-rose-500/10 text-rose-400"
                            : rsi < 30
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-slate-800 text-slate-400"
                        }`}>
                          {rsi > 70 ? "Overbought" : rsi < 30 ? "Oversold" : "Neutral"}
                        </span>
                      )}
                    </div>
                    
                    {/* Horizontal RSI Range meter */}
                    <div className="w-full h-2 bg-slate-800 rounded-full relative overflow-hidden mt-3 mb-2">
                      <div className="absolute left-0 top-0 bottom-0 w-[30%] bg-emerald-500/20" />
                      <div className="absolute left-[70%] top-0 bottom-0 w-[30%] bg-rose-500/20" />
                      {rsi !== undefined && rsi !== null && (
                        <div
                          className={`absolute top-0 bottom-0 w-1 rounded ${
                            rsi > 70 ? "bg-rose-500" : rsi < 30 ? "bg-emerald-500" : "bg-cyan-400"
                          }`}
                          style={{ left: `${rsi}%` }}
                        />
                      )}
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-600 font-bold uppercase mt-1">
                      <span>0 (Oversold)</span>
                      <span>50</span>
                      <span>100 (Overbought)</span>
                    </div>
                  </div>

                  {/* Relative Volume Gauge */}
                  <div className={`bg-slate-950/20 border p-4 rounded-2xl flex flex-col justify-between transition-all duration-300 ${
                    relativeVolume !== undefined && relativeVolume !== null && relativeVolume > 1.5
                      ? "border-purple-500/30 shadow-lg shadow-purple-500/5"
                      : "border-slate-850"
                  }`}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Relative Volume</span>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-2xl font-black tabular-nums ${
                        relativeVolume !== undefined && relativeVolume !== null && relativeVolume > 1.5 ? "text-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.2)]" : "text-slate-100"
                      }`}>
                        {relativeVolume !== undefined && relativeVolume !== null ? `${relativeVolume.toFixed(2)}x` : "N/A"}
                      </span>
                      {relativeVolume !== undefined && relativeVolume !== null && relativeVolume > 1.5 && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/20 animate-pulse">
                          Volume Spike
                        </span>
                      )}
                    </div>
                    
                    {/* Horizontal relative volume bar */}
                    <div className="w-full h-2 bg-slate-800 rounded-full relative overflow-hidden mt-3 mb-2">
                      {relativeVolume !== undefined && relativeVolume !== null && (
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            relativeVolume > 1.5
                              ? "bg-gradient-to-r from-purple-500 to-indigo-500"
                              : "bg-cyan-500"
                          }`}
                          style={{ width: `${Math.min(relativeVolume * 33, 100)}%` }}
                        />
                      )}
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-600 font-bold uppercase mt-1">
                      <span>0.0x</span>
                      <span>1.5x (High)</span>
                      <span>3.0x+</span>
                    </div>
                  </div>

                  {/* Trend Strength (ADX) Gauge */}
                  {stockDetails.trend_strength !== undefined && (
                    <div className="bg-slate-950/20 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between sm:col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Trend Strength (ADX)</span>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-2xl font-black text-slate-100 tabular-nums">{stockDetails.trend_strength}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                          stockDetails.trend_strength >= 50
                            ? "bg-cyan-500/10 text-cyan-400"
                            : stockDetails.trend_strength >= 25
                            ? "bg-indigo-500/10 text-indigo-400"
                            : "bg-slate-855 text-slate-400"
                        }`}>
                          {stockDetails.trend_strength >= 50 ? "Strong Trend" : stockDetails.trend_strength >= 25 ? "Moderate Trend" : "Weak Trend"}
                        </span>
                      </div>
                      
                      {/* ADX Progress Slider */}
                      <div className="w-full h-2 bg-slate-800 rounded-full relative overflow-hidden mt-3 mb-2">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 transition-all duration-500"
                          style={{ width: `${stockDetails.trend_strength}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[8px] text-slate-600 font-bold uppercase mt-1">
                        <span>0 (Weak)</span>
                        <span>25 (Trend)</span>
                        <span>50 (Strong)</span>
                        <span>100 (Extreme)</span>
                      </div>
                    </div>
                  )}

                </div>

                {/* Detailed Technical Metrics Grid */}
                <div className="bg-slate-950/20 border border-slate-850 p-4 rounded-2xl">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Technical Indicators</h3>
                  <div className="grid grid-cols-2 gap-3.5 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                      <span className="text-slate-500 font-medium">Z-Score:</span>
                      <span className={`font-bold tabular-nums ${
                        zScore !== undefined && zScore !== null && zScore > 1.5 
                          ? "text-emerald-400" 
                          : zScore !== undefined && zScore !== null && zScore < -1.5 
                          ? "text-rose-400" 
                          : "text-slate-300"
                      }`}>
                        {zScore !== undefined && zScore !== null 
                          ? `${zScore > 0 ? "+" : ""}${zScore.toFixed(2)}` 
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                      <span className="text-slate-500 font-medium">Volume:</span>
                      <span className="font-bold text-slate-300 tabular-nums">
                        {volume !== undefined && volume !== null 
                          ? `${(volume / 100000).toFixed(1)}L` 
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                      <span className="text-slate-500 font-medium">Avg Volume:</span>
                      <span className="font-bold text-slate-300 tabular-nums">
                        {avgVolume !== undefined && avgVolume !== null 
                          ? `${(avgVolume / 100000).toFixed(1)}L` 
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                      <span className="text-slate-500 font-medium">ATR (Volatility):</span>
                      <span className="font-bold text-slate-300 tabular-nums">
                        {stockDetails.atr !== undefined && stockDetails.atr !== null 
                          ? stockDetails.atr.toFixed(2) 
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                      <span className="text-slate-500 font-medium">Liquidity:</span>
                      <span className="font-bold text-slate-300 tabular-nums">
                        {liquidity !== undefined && liquidity !== null 
                          ? `${(liquidity > 1 ? liquidity : liquidity * 100).toFixed(0)}%` 
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                      <span className="text-slate-500 font-medium">Bid-Ask Spread:</span>
                      <span className="font-bold text-slate-300 tabular-nums">
                        {spread !== undefined && spread !== null 
                          ? formatCurrency(spread) 
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                      <span className="text-slate-500 font-medium">Opening Range:</span>
                      <span className={`font-black uppercase text-[10px] px-1.5 py-0.2 rounded ${
                        openingRange === "BREAKOUT"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-slate-800 text-slate-400 border border-slate-700/30"
                      }`}>
                        {openingRange || "INSIDE"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                      <span className="text-slate-500 font-medium">Opening Gap:</span>
                      <span className={`font-bold tabular-nums ${
                        (openingGap || 0) > 0 
                          ? "text-emerald-400" 
                          : (openingGap || 0) < 0 
                          ? "text-rose-400" 
                          : "text-slate-300"
                      }`}>
                        {openingGap !== undefined && openingGap !== null 
                          ? `${openingGap > 0 ? "+" : ""}${openingGap.toFixed(2)}%` 
                          : "0.00%"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Setup Factors */}
                <div className="bg-slate-950/20 border border-slate-850 p-4 rounded-2xl">
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-cyan-400 animate-pulse" />
                    Setup Factors
                  </h3>
                  
                  <ul className="space-y-2">
                    {stockDetails.reasons && stockDetails.reasons.length > 0 ? (
                      stockDetails.reasons.map((reason, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed">
                          <span className="text-cyan-400 mt-1 select-none">•</span>
                          <span>{reason}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-slate-500 italic">No setup factors available for this ticker.</li>
                    )}
                  </ul>
                </div>

                {/* AI Overlay Debug Panel */}
                <AiDebugPanel stockDetails={stockDetails} />

              </div>
            );
          })()}

          {/* Details Error Banner when news is available */}
          {!detailsLoading && detailsError && selectedStockNews && (
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/20 text-slate-400 text-[11px] flex items-center gap-2">
              <ShieldAlert size={14} className="text-amber-500 shrink-0" />
              <div>Note: Technical scan indicators are currently unavailable for this asset. Showing news sentiment feed.</div>
            </div>
          )}

          {/* AI News Sentiment Analysis */}
          {!detailsLoading && selectedStockNews && (
            <div className="bg-slate-950/20 border border-slate-850 p-4 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-850 pb-2">
                <Newspaper size={13} className="text-cyan-400" />
                AI News Sentiment Analysis
              </h3>
              
              {/* Sentiment details */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Sentiment State:</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-black text-[10px] uppercase border ${
                  selectedStockNews.direction === "bullish"
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25"
                    : selectedStockNews.direction === "bearish"
                    ? "text-rose-400 bg-rose-500/10 border-rose-500/25"
                    : "text-slate-400 bg-slate-800/50 border-slate-700/40"
                }`}>
                  {selectedStockNews.direction} ({selectedStockNews.impact} Impact)
                </span>
              </div>

              {/* Summary */}
              {selectedStockNews.summary && (
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-900 text-xs italic text-slate-350 leading-relaxed">
                  {selectedStockNews.summary}
                </div>
              )}

              {/* Headlines */}
              {selectedStockNews.headlines && selectedStockNews.headlines.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Latest Headlines</span>
                  <ul className="space-y-2">
                    {selectedStockNews.headlines.map((headline, idx) => (
                      <li key={idx} className="text-xs text-slate-350 flex items-start gap-2 leading-relaxed">
                        <span className="text-cyan-500 mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        <span>{headline}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Last Sync */}
              {selectedStockNews.last_updated && (
                <div className="text-[10px] text-slate-500 text-right pt-2 border-t border-slate-900/60 mt-2">
                  Updated at {new Date(selectedStockNews.last_updated).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </div>
              )}
            </div>
          )}


        </div>
        
        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close Analysis
          </button>
        </div>

      </motion.div>
    </div>
  );
};

const AiDebugPanel: React.FC<{ stockDetails: StockDetailsResponse }> = ({ stockDetails }) => {
  const [aiDebugOpen, setAiDebugOpen] = React.useState(false);

  if (!stockDetails.ai_model_used && !stockDetails.ai_input_payload && !stockDetails.ai_output_payload) {
    return null;
  }

  return (
    <div className="bg-slate-950/20 border border-slate-850 p-4 rounded-2xl">
      <button
        type="button"
        onClick={() => setAiDebugOpen(!aiDebugOpen)}
        className="w-full flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-cyan-400 transition-colors cursor-pointer animate-none"
      >
        <span className="flex items-center gap-1.5">
          <SlidersHorizontal size={13} className="text-purple-400" />
          AI Analysis Debug Payload
        </span>
        <span>{aiDebugOpen ? "Hide" : "Show"}</span>
      </button>

      {aiDebugOpen && (
        <div className="mt-4 space-y-4 border-t border-slate-900 pt-4 text-xs">
          {stockDetails.ai_model_used && (
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Model Used:</span>
              <span className="font-mono text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-850 text-[10px]">
                {stockDetails.ai_model_used}
              </span>
            </div>
          )}

          {stockDetails.base_score !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Score Modification:</span>
              <span className="font-bold text-slate-300">
                Base: {(stockDetails.base_score).toFixed(2)} | AI Mod: {stockDetails.ai_score_adjustment !== undefined ? (stockDetails.ai_score_adjustment >= 0 ? `+${stockDetails.ai_score_adjustment.toFixed(2)}` : stockDetails.ai_score_adjustment.toFixed(2)) : "0.00"} | Final: {((stockDetails.base_score || 0) + (stockDetails.ai_score_adjustment || 0)).toFixed(2)}
              </span>
            </div>
          )}

          {stockDetails.ai_input_payload && (
            <div className="space-y-1.5">
              <span className="text-slate-500 font-medium block text-left">AI Input Payload:</span>
              <pre className="bg-slate-950 p-3 rounded-lg overflow-x-auto text-[10px] text-slate-400 border border-slate-850 max-h-48 font-mono select-all text-left">
                {JSON.stringify(stockDetails.ai_input_payload, null, 2)}
              </pre>
            </div>
          )}

          {stockDetails.ai_output_payload && (
            <div className="space-y-1.5">
              <span className="text-slate-500 font-medium block text-left">AI Output Payload:</span>
              <pre className="bg-slate-950 p-3 rounded-lg overflow-x-auto text-[10px] text-cyan-400 border border-slate-850 max-h-48 font-mono select-all text-left">
                {JSON.stringify(stockDetails.ai_output_payload, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
