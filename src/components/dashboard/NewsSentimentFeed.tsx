import React from "react";
import { Newspaper, ArrowUpRight, TrendingUp, TrendingDown, MessageSquare } from "lucide-react";
import { NewsSentimentResponse, NewsSentimentItem } from "./types";

interface NewsSentimentFeedProps {
  newsSentiment: NewsSentimentResponse | null;
  onSelectStock: (symbol: string) => void;
}

export const NewsSentimentFeed: React.FC<NewsSentimentFeedProps> = ({
  newsSentiment,
  onSelectStock
}) => {
  const newsEntries = newsSentiment ? Object.entries(newsSentiment) : [];

  const getSentimentBadge = (item: NewsSentimentItem) => {
    const dir = item.direction?.toLowerCase();
    const imp = item.impact?.toLowerCase();
    
    let colorClasses = "text-slate-400 bg-slate-800/50 border-slate-700/40";
    let text = "Neutral Sentiment";
    let adjText = "";

    if (dir === "bullish") {
      colorClasses = "text-emerald-400 bg-emerald-500/10 border-emerald-500/25";
      text = "Bullish";
      if (imp === "high") {
        adjText = "(+0.10 Score Adj)";
      } else if (imp === "medium") {
        adjText = "(+0.05 Score Adj)";
      } else {
        adjText = "(No Adj)";
      }
    } else if (dir === "bearish") {
      colorClasses = "text-rose-400 bg-rose-500/10 border-rose-500/25";
      text = "Bearish";
      if (imp === "high") {
        adjText = "(-0.10 Score Adj)";
      } else if (imp === "medium") {
        adjText = "(-0.05 Score Adj)";
      } else {
        adjText = "(No Adj)";
      }
    }

    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-black text-[9px] uppercase border ${colorClasses}`}>
          {dir === "bullish" && <TrendingUp size={10} />}
          {dir === "bearish" && <TrendingDown size={10} />}
          {text}
        </span>
        {adjText && (
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">
            {adjText}
          </span>
        )}
      </div>
    );
  };

  return (
    <section className="flex flex-col h-full mt-2">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
          <Newspaper size={14} className="text-cyan-500" />
          Live News Sentiment Feed (AI-Analyzed)
        </h2>
        <span className="text-[10px] text-slate-500 font-medium bg-slate-900 px-2 py-0.5 border border-slate-800 rounded">
          {newsEntries.length} sources tracking
        </span>
      </div>

      <div className="flex-1 bg-slate-900/20 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col shadow-xl justify-start overflow-hidden min-h-[300px]">
        {newsEntries.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
            <MessageSquare size={36} className="text-slate-600 mb-4 animate-pulse" />
            <h3 className="font-bold text-slate-400 text-sm">Awaiting news sentiment ingestion</h3>
            <p className="text-xs text-slate-650 max-w-xs mt-1">
              Active stock symbols will populate the news analyzer stream once background workers ingest sector telemetry.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[500px] pr-1 custom-scrollbar">
            {newsEntries.map(([symbol, item]) => (
              <div
                key={symbol}
                onClick={() => onSelectStock(symbol)}
                className="bg-slate-955/30 hover:bg-slate-900/30 border border-slate-850 hover:border-slate-700/60 rounded-2xl p-4 transition-all duration-200 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
              >
                {/* Visual side line accent */}
                <div className={`absolute left-0 inset-y-0 w-[3px] ${
                  item.direction === "bullish" 
                    ? "bg-emerald-500/60" 
                    : item.direction === "bearish" 
                    ? "bg-rose-500/60" 
                    : "bg-slate-700/40"
                }`} />

                <div className="space-y-3 pl-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-black text-sm text-white group-hover:text-cyan-400 transition-colors flex items-center gap-1">
                      {symbol}
                      <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
                    </span>
                    {getSentimentBadge(item)}
                  </div>

                  {/* Headlines list */}
                  {item.headlines && item.headlines.length > 0 && (
                    <div className="space-y-1">
                      {item.headlines.slice(0, 2).map((headline, idx) => (
                        <p key={idx} className="text-xs text-slate-300 leading-relaxed font-medium flex items-start gap-1.5">
                          <span className="text-cyan-500 mt-1.5 shrink-0 w-1 h-1 rounded-full bg-cyan-500" />
                          <span>{headline}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  {/* AI Summary */}
                  {item.summary && (
                    <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-900 text-[10px] text-slate-400 italic leading-relaxed">
                      <span className="font-bold uppercase text-[8px] text-slate-500 block mb-0.5">AI Copilot Rationale</span>
                      {item.summary}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-3 border-t border-slate-900/60 pt-2 pl-1.5">
                  <span>Horizon: {item.horizon || "intraday"}</span>
                  <span>Updated: {item.last_updated ? new Date(item.last_updated).toLocaleTimeString() : "N/A"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
