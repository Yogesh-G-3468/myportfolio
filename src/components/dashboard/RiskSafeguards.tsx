import React from "react";
import { Scale, DollarSign, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { RiskState, getPnLColor, getPnLColorSimple, formatPnL, formatCurrency } from "./types";

interface RiskSafeguardsProps {
  riskState: RiskState | null;
}

export const RiskSafeguards: React.FC<RiskSafeguardsProps> = ({ riskState }) => {
  return (
    <section className="mb-6">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <Scale size={14} className="text-slate-400" />
        Live Risk Safeguard Center
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Account Capital */}
        <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700/60 transition-all duration-300">
          <div className="absolute top-0 right-0 p-3 opacity-[0.03] text-white pointer-events-none group-hover:scale-110 transition-transform">
            <DollarSign size={80} />
          </div>
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
            Equity Base Capital
          </div>
          <div className="text-2xl font-black text-white tabular-nums tracking-tight">
            {riskState ? formatCurrency(riskState.account_equity) : "₹0.00"}
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">
            Starting Balance Limit
          </div>
        </div>

        {/* Today realized PnL */}
        <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700/60 transition-all duration-300">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
            Realized PnL (Today)
          </div>
          <div className={`text-2xl font-black tabular-nums tracking-tight transition-colors ${
            getPnLColor(riskState?.realized_pnl_today)
          }`}>
            {riskState ? formatPnL(riskState.realized_pnl_today) : "₹0.00"}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 font-medium">
            {(riskState?.realized_pnl_today ?? 0) > 0 ? (
              <TrendingUp size={11} className="text-emerald-400" />
            ) : (riskState?.realized_pnl_today ?? 0) < 0 ? (
              <TrendingDown size={11} className="text-rose-400" />
            ) : (
              <Clock size={11} className="text-slate-500" />
            )}
            Real-time session outcomes
          </div>
        </div>

        {/* Weekly/Monthly aggregated PnL */}
        <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700/60 transition-all duration-300">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
            PnL Aggregate Trend
          </div>
          <div className="flex flex-col gap-1.5 justify-center">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Past 7d:</span>
              <span className={`font-bold tabular-nums ${
                getPnLColorSimple(riskState?.realized_pnl_week)
              }`}>
                {riskState ? formatPnL(riskState.realized_pnl_week) : "₹0.00"}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Past 30d:</span>
              <span className={`font-bold tabular-nums ${
                getPnLColorSimple(riskState?.realized_pnl_month)
              }`}>
                {riskState ? formatPnL(riskState.realized_pnl_month) : "₹0.00"}
              </span>
            </div>
          </div>
        </div>

        {/* Combined Open Risk */}
        <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700/60 transition-all duration-300">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
            Combined Open Risk
          </div>
          <div className="text-2xl font-black text-cyan-400 tabular-nums tracking-tight drop-shadow-[0_0_12px_rgba(34,211,238,0.15)]">
            {riskState ? formatCurrency(riskState.open_risk) : "₹0.00"}
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">
            At-risk active capital: <strong className="text-slate-400">{riskState ? ((riskState.open_risk / riskState.account_equity) * 100).toFixed(2) : 0}%</strong>
          </div>
        </div>

      </div>
    </section>
  );
};
