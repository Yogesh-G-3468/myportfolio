"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, CheckCircle, Trash2, ShieldCheck, Sparkles } from 'lucide-react';
import { Suggestion } from '../../lib/twitterTypes';
import { TweetCard } from './TweetCard';

interface ReviewQueueProps {
  suggestions: Suggestion[];
  activeTab: 'suggested' | 'posted' | 'rejected';
  onTabChange: (tab: 'suggested' | 'posted' | 'rejected') => void;
  onSave: (id: number, tweets: string[]) => Promise<void>;
  onReject: (id: number) => Promise<void>;
  onMarkPosted: (id: number) => void;
  counts: {
    suggested: number;
    posted: number;
    rejected: number;
  };
}

export const ReviewQueue: React.FC<ReviewQueueProps> = ({
  suggestions,
  activeTab,
  onTabChange,
  onSave,
  onReject,
  onMarkPosted,
  counts,
}) => {
  // Helpers for styling active tabs
  const getTabClass = (tab: 'suggested' | 'posted' | 'rejected') => {
    const base = 'flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all relative cursor-pointer';
    if (activeTab === tab) {
      if (tab === 'suggested') return `${base} text-cyan-400 bg-cyan-500/10 border border-cyan-500/20`;
      if (tab === 'posted') return `${base} text-emerald-400 bg-emerald-500/10 border border-emerald-500/20`;
      return `${base} text-rose-400 bg-rose-500/10 border border-rose-500/20`;
    }
    return `${base} text-gray-400 hover:text-white hover:bg-white/[0.03] border border-transparent`;
  };

  const getEmptyStateIcon = () => {
    if (activeTab === 'suggested') return <Inbox size={48} className="text-cyan-400/50" />;
    if (activeTab === 'posted') return <CheckCircle size={48} className="text-emerald-400/50" />;
    return <Trash2 size={48} className="text-rose-400/50" />;
  };

  const getEmptyStateMessage = () => {
    if (activeTab === 'suggested') {
      return {
        title: 'Review queue is empty!',
        desc: 'Good job! All suggestions have been reviewed, posted, or archived. Scan Trend Scouts to draft more content.',
      };
    }
    if (activeTab === 'posted') {
      return {
        title: 'No published posts yet',
        desc: 'Suggestions that are marked as posted with their live URLs will appear here for historical analytics.',
      };
    }
    return {
      title: 'Archive is clean',
      desc: 'Rejected drafts are soft-deleted and kept here in case you need to re-evaluate them later.',
    };
  };

  const emptyState = getEmptyStateMessage();

  return (
    <div className="space-y-6">
      {/* Tab Filter controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex space-x-3.5">
          <button
            onClick={() => onTabChange('suggested')}
            className={getTabClass('suggested')}
          >
            <span>Suggestions Queue</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === 'suggested' 
                ? 'bg-cyan-400 text-[#0B0F19]' 
                : 'bg-white/5 text-gray-400'
            }`}>
              {counts.suggested}
            </span>
          </button>

          <button
            onClick={() => onTabChange('posted')}
            className={getTabClass('posted')}
          >
            <span>Posted</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === 'posted' 
                ? 'bg-emerald-400 text-[#0B0F19]' 
                : 'bg-white/5 text-gray-400'
            }`}>
              {counts.posted}
            </span>
          </button>

          <button
            onClick={() => onTabChange('rejected')}
            className={getTabClass('rejected')}
          >
            <span>Rejected</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === 'rejected' 
                ? 'bg-rose-400 text-[#0B0F19]' 
                : 'bg-white/5 text-gray-400'
            }`}>
              {counts.rejected}
            </span>
          </button>
        </div>

        {/* Quality status summary */}
        {activeTab === 'suggested' && suggestions.length > 0 && (
          <div className="flex items-center space-x-2 text-xs text-gray-400 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>AI Automated Quality Gates Active</span>
          </div>
        )}
      </div>

      {/* Suggestion list or empty state */}
      <AnimatePresence mode="popLayout">
        {suggestions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]"
          >
            <div className="p-4 rounded-full bg-white/5 mb-4 animate-pulse">
              {getEmptyStateIcon()}
            </div>
            <h3 className="text-md font-semibold text-gray-300">{emptyState.title}</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm text-center leading-relaxed">
              {emptyState.desc}
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="space-y-5"
          >
            {suggestions.map((suggestion) => (
              <TweetCard
                key={suggestion.id}
                suggestion={suggestion}
                onSave={onSave}
                onReject={onReject}
                onMarkPosted={onMarkPosted}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
