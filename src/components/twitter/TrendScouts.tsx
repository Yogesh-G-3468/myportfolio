"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, TrendingUp, Cpu, RefreshCw, MessageSquarePlus } from 'lucide-react';
import { TrendTopic } from '../../lib/twitterTypes';

interface TrendScoutsProps {
  topics: TrendTopic[];
  onScan: () => Promise<void>;
  onScanDeep: () => Promise<void>;
  onGenerate: (topicId: number) => Promise<void>;
  onDraftFromUrl: (url: string) => Promise<void>;
}

export const TrendScouts: React.FC<TrendScoutsProps> = ({ topics, onScan, onScanDeep, onGenerate, onDraftFromUrl }) => {
  const [scanning, setScanning] = useState(false);
  const [scanningDeep, setScanningDeep] = useState(false);
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  
  // Custom URL draft state
  const [draftUrl, setDraftUrl] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);

  const handleScan = async () => {
    setScanning(true);
    try {
      await onScan();
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const handleScanDeep = async () => {
    setScanningDeep(true);
    try {
      await onScanDeep();
    } catch (err) {
      console.error(err);
    } finally {
      setScanningDeep(false);
    }
  };

  const handleGenerate = async (topicId: number) => {
    setGeneratingId(topicId);
    try {
      await onGenerate(topicId);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDraftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftUrl.trim()) return;
    setIsDrafting(true);
    try {
      await onDraftFromUrl(draftUrl.trim());
      setDraftUrl('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsDrafting(false);
    }
  };

  // Helper to color relevance score pills
  const getRelevanceBadgeClass = (score: number) => {
    if (score >= 9) return 'bg-rose-500/10 text-rose-400 border border-rose-500/35 shadow-[0_0_10px_rgba(244,63,94,0.15)]';
    if (score >= 7) return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/35';
    return 'bg-amber-500/10 text-amber-400 border border-amber-500/35';
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <TrendingUp className="text-cyan-400" size={22} />
            <span>Trend Scouts</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Scan external developer forums, GitHub repositories, and tech Twitter/X for viral content opportunities.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={handleScan}
            disabled={scanning || scanningDeep}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold px-5 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(6,182,212,0.15)] cursor-pointer text-xs sm:text-sm"
          >
            <RefreshCw size={16} className={scanning ? 'animate-spin' : ''} />
            <span>{scanning ? 'Scanning General...' : 'Scan General Trends'}</span>
          </button>
          
          <button
            onClick={handleScanDeep}
            disabled={scanning || scanningDeep}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold px-5 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(139,92,246,0.25)] hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] cursor-pointer text-xs sm:text-sm"
          >
            <RefreshCw size={16} className={scanningDeep ? 'animate-spin' : ''} />
            <span>{scanningDeep ? 'Scanning Deep Tech...' : 'Scan Deep Tech'}</span>
          </button>
        </div>
      </div>

      {/* Custom URL Drafting Card */}
      <div className="bg-[#15202B]/30 border border-white/5 rounded-2xl p-6">
        <h3 className="text-md font-bold text-white flex items-center space-x-2 mb-2">
          <MessageSquarePlus className="text-cyan-400" size={18} />
          <span>Draft Tweet from Custom URL</span>
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Paste any YouTube video or article link to automatically extract transcripts/content and draft a creator-style tweet or thread.
        </p>
        <form onSubmit={handleDraftSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            required
            placeholder="https://www.youtube.com/watch?v=... or https://techcrunch.com/..."
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            className="flex-1 bg-[#0B0F19]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          />
          <button
            type="submit"
            disabled={isDrafting}
            className="flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isDrafting ? (
              <>
                <RefreshCw size={16} className="animate-spin text-cyan-400" />
                <span>Drafting...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} className="text-cyan-400" />
                <span>Draft Tweet</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Loading state for entire panel when topics are empty */}
      {topics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
          <div className="p-4 rounded-full bg-cyan-500/5 text-cyan-400 mb-4 animate-pulse">
            <Search size={36} />
          </div>
          <h3 className="text-md font-semibold text-gray-300">No scanned topics found</h3>
          <p className="text-xs text-gray-500 mt-1 mb-6 text-center max-w-sm">
            Scan the external space to populate tech trends and generate high-engagement suggestions.
          </p>
          <button
            onClick={handleScan}
            disabled={scanning}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw size={14} className={scanning ? 'animate-spin' : ''} />
            <span>Scan Now</span>
          </button>
        </div>
      ) : (
        /* Topics Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {topics.map((topic) => {
            const isGenerating = generatingId === topic.id;
            const isDrafted = topic.status === 'drafted';

            return (
              <motion.div
                key={topic.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className={`relative flex flex-col justify-between bg-[#15202B]/30 border rounded-2xl p-5 transition-colors ${
                  isDrafted 
                    ? 'border-emerald-500/20 bg-emerald-500/[0.01]' 
                    : 'border-white/5 hover:border-white/10'
                }`}
              >
                <div>
                  {/* Topic header: Name & score */}
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <h3 className="text-md font-bold text-white leading-snug">
                      {topic.name}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 uppercase ${getRelevanceBadgeClass(topic.relevance_score)}`}>
                      Relevance: {topic.relevance_score}/10
                    </span>
                  </div>

                  {/* Why Trending */}
                  <div className="mb-4">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Why Trending
                    </span>
                    <p className="text-xs text-gray-300 leading-relaxed bg-white/[0.01] border border-white/5 rounded-lg p-2.5">
                      {topic.why_trending}
                    </p>
                  </div>

                  {/* Content Angle */}
                  <div className="mb-4">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Proposed Angle
                    </span>
                    <p className="text-xs text-cyan-300/90 leading-relaxed font-medium">
                      {topic.content_angle}
                    </p>
                  </div>

                  {/* Sources */}
                  {topic.source_urls && topic.source_urls.length > 0 && (
                    <div className="mb-5">
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                        Sources
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {topic.source_urls.map((url, urlIdx) => {
                          let label = "🔗 Reference Link";
                          if (url.includes("github.com")) {
                            label = "🔗 GitHub Repository";
                          } else if (url.includes("arxiv.org")) {
                            label = "📄 ArXiv Research Paper";
                          } else if (url.includes("ycombinator.com")) {
                            label = "🔗 Hacker News Thread";
                          } else if (url.includes("dev.to")) {
                            label = "🔗 Dev.to Article";
                          } else if (url.includes("techcrunch.com")) {
                            label = "🔗 TechCrunch Article";
                          } else if (url.includes("theverge.com")) {
                            label = "🔗 The Verge Article";
                          } else if (url.includes("jeffgeerling.com")) {
                            label = "🔗 Jeff Geerling Blog";
                          } else if (url.includes("lwn.net")) {
                            label = "🔗 LWN Article";
                          } else if (url.includes("economist.com")) {
                            label = "🔗 The Economist Article";
                          } else if (url.includes("gingerbill.org")) {
                            label = "🔗 Ginger Bill Article";
                          } else if (url.includes("openai.com")) {
                            label = "🔗 OpenAI Reference";
                          }
                          return (
                            <a
                              key={urlIdx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-cyan-950/40 border border-cyan-800/30 text-cyan-400 hover:bg-cyan-900/40 hover:text-cyan-300 transition-all flex items-center gap-1"
                            >
                              {label}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card CTA Actions */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-medium">
                    Topic ID: #{topic.id}
                  </span>

                  {isDrafted ? (
                    <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
                      <Sparkles size={12} />
                      <span>Draft Generated!</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleGenerate(topic.id)}
                      disabled={isGenerating || !!generatingId}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-white/5 disabled:text-gray-500 disabled:cursor-not-allowed text-[#0B0F19] text-xs font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)] hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-[#0B0F19] border-t-transparent rounded-full animate-spin mr-1" />
                          <span>Drafting with Gemini...</span>
                        </>
                      ) : (
                        <>
                          <Cpu size={13} />
                          <span>Draft Tweet/Thread</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Shimmer/pulse overlay during generation */}
                {isGenerating && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] rounded-2xl flex flex-col items-center justify-center space-y-3 z-10 border border-cyan-500/20">
                    <div className="relative">
                      <div className="w-10 h-10 border-4 border-cyan-500/10 border-t-cyan-400 rounded-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center text-cyan-400 animate-pulse">
                        <Sparkles size={16} />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-cyan-400 animate-pulse">
                      Gemini is composing...
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
