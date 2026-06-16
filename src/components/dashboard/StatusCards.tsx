import React from "react";
import { Clock } from "lucide-react";
import { LiveScannerResponse } from "./types";

interface StatusCardsProps {
  liveData: LiveScannerResponse | null;
  isDemoMode: boolean;
  marketOpen: boolean;
  setMarketOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fetchDashboardData: () => void;
}

export const StatusCards: React.FC<StatusCardsProps> = ({
  liveData,
  isDemoMode,
  marketOpen,
  setMarketOpen,
  fetchDashboardData
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      
      {/* Market State */}
      <div 
        onClick={() => {
          if (isDemoMode) {
            const nextState = !marketOpen;
            setMarketOpen(nextState);
            setTimeout(() => fetchDashboardData(), 50);
          }
        }}
        className={`bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700/60 transition-all duration-300 ${
          isDemoMode ? "cursor-pointer active:scale-[0.98]" : ""
        }`}
      >
        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2 flex justify-between items-center">
          <span>Market State</span>
          {isDemoMode && (
            <span className="text-[8px] font-bold text-cyan-400 border border-cyan-500/20 bg-cyan-500/10 px-1 py-0.2 rounded uppercase tracking-wider animate-pulse">
              Toggle Demo
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`w-2.5 h-2.5 rounded-full ${
            liveData?.market_state === "OPEN" ? "bg-emerald-500 animate-ping" : "bg-amber-500"
          }`} />
          <span className={`text-xl font-black uppercase tracking-wider ${
            liveData?.market_state === "OPEN" ? "text-emerald-400" : "text-amber-500"
          }`}>
            {liveData?.market_state || "CLOSED"}
          </span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1 font-medium">
          {liveData?.market_state === "OPEN" 
            ? "Intraday signals actively scanning" 
            : "Outside market hours - Offline analysis active"}
        </p>
      </div>

      {/* Qualified Count */}
      <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700/60 transition-all duration-300">
        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
          Qualified Stocks Count
        </div>
        <div className="text-2xl font-black text-cyan-400 mt-1 tabular-nums tracking-tight">
          {liveData?.qualified_count ?? 0}
        </div>
        <p className="text-[10px] text-slate-500 mt-1 font-medium">
          Assets matching the active filter criteria
        </p>
      </div>

      {/* Latest Scan Time */}
      <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700/60 transition-all duration-300">
        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
          Latest Scan Time
        </div>
        <div className="text-xl font-black text-slate-200 mt-1 flex items-center gap-2">
          <Clock size={18} className="text-cyan-500" />
          <span className="tabular-nums">
            {liveData?.scan_time ? new Date(liveData.scan_time).toLocaleTimeString() : "--:--:--"}
          </span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1 font-medium">
          Automatic scanning active
        </p>
      </div>

    </div>
  );
};
