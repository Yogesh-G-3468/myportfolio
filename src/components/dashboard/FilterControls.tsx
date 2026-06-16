import React from "react";
import { ChevronDown } from "lucide-react";

interface FilterControlsProps {
  selectedUniverse: "NIFTY50" | "FO" | "CUSTOM";
  setSelectedUniverse: (val: "NIFTY50" | "FO" | "CUSTOM") => void;
  minScore: number;
  setMinScore: (val: number) => void;
  directionFilter: "All" | "BUY" | "SELL";
  setDirectionFilter: (val: "All" | "BUY" | "SELL") => void;
  minConfidence: number;
  setMinConfidence: (val: number) => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  selectedUniverse,
  setSelectedUniverse,
  minScore,
  setMinScore,
  directionFilter,
  setDirectionFilter,
  minConfidence,
  setMinConfidence
}) => {
  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-[20]">
      <div className="flex flex-wrap items-center gap-4">
        
        {/* Universe Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stock Universe</label>
          <div className="relative">
            <select
              value={selectedUniverse}
              onChange={(e) => setSelectedUniverse(e.target.value as any)}
              className="appearance-none bg-slate-950/60 border border-slate-850 hover:border-slate-700 rounded-xl px-3 py-2 pr-8 text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
            >
              <option value="NIFTY50">NIFTY 50 Universe</option>
              <option value="FO">Futures & Options (FO)</option>
              <option value="CUSTOM">Custom Watchlist</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Direction Filter Toggle */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trade Direction</label>
          <div className="flex bg-slate-950/60 border border-slate-850 rounded-xl p-1">
            {(["All", "BUY", "SELL"] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => setDirectionFilter(dir)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  directionFilter === dir
                    ? "bg-cyan-500/20 text-cyan-400 shadow-sm border-cyan-500/10 border"
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                {dir}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 md:justify-end">
        {/* Minimum Score Slider */}
        <div className="flex flex-col gap-1.5 w-full md:w-48">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
            <span className="text-slate-500">Min Composite Score</span>
            <span className="text-cyan-400 tabular-nums">{minScore.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={minScore}
            onChange={(e) => setMinScore(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* Minimum Confidence Slider */}
        <div className="flex flex-col gap-1.5 w-full md:w-48">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
            <span className="text-slate-500">Min Confidence</span>
            <span className="text-cyan-400 tabular-nums">{minConfidence.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={minConfidence}
            onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>
      </div>
    </div>
  );
};
