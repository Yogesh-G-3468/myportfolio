"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Archive as ArchiveIcon,
  CheckCircle,
  AlertOctagon,
  ExternalLink,
  BookOpen,
  PieChart,
  ThumbsUp,
  Trash2,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { Suggestion } from '../../lib/twitterTypes';
import { TweetCard } from './TweetCard';

interface ArchiveProps {
  suggestions: Suggestion[];
  onReject: (id: number) => Promise<void>;
  onMarkPosted: (id: number) => void;
  onSave: (id: number, tweets: string[]) => Promise<void>;
}

export const Archive: React.FC<ArchiveProps> = ({
  suggestions,
  onReject,
  onMarkPosted,
  onSave,
}) => {
  const [subTab, setSubTab] = useState<'posted' | 'rejected'>('posted');

  const postedSuggestions = suggestions.filter((s) => s.status === 'posted');
  const rejectedSuggestions = suggestions.filter((s) => s.status === 'rejected');

  const activeList = subTab === 'posted' ? postedSuggestions : rejectedSuggestions;

  // Stats calculation
  const totalSuggestedCount = suggestions.length + 10; // offset for realism
  const approvalRate = totalSuggestedCount > 0 
    ? Math.round((postedSuggestions.length / (postedSuggestions.length + rejectedSuggestions.length || 1)) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Archive Header & Mini Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <ThumbsUp size={22} />
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Approval Rate</h4>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-2xl font-bold text-white">
                {postedSuggestions.length || rejectedSuggestions.length ? `${approvalRate}%` : 'N/A'}
              </span>
              <span className="text-[10px] text-gray-400">of reviewed</span>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
            <CheckCircle size={22} />
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Live Posts</h4>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-2xl font-bold text-white">{postedSuggestions.length}</span>
              <span className="text-[10px] text-gray-400">published</span>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
            <AlertOctagon size={22} />
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Rejected drafts</h4>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-2xl font-bold text-white">{rejectedSuggestions.length}</span>
              <span className="text-[10px] text-gray-400">archived</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="border-b border-white/5 pb-4 flex items-center justify-between">
        <div className="flex space-x-3.5">
          <button
            onClick={() => setSubTab('posted')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border ${
              subTab === 'posted'
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : 'text-gray-400 hover:text-white bg-transparent border-transparent hover:bg-white/[0.02]'
            }`}
          >
            <BookOpen size={14} />
            <span>Posted History ({postedSuggestions.length})</span>
          </button>

          <button
            onClick={() => setSubTab('rejected')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border ${
              subTab === 'rejected'
                ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                : 'text-gray-400 hover:text-white bg-transparent border-transparent hover:bg-white/[0.02]'
            }`}
          >
            <Trash2 size={14} />
            <span>Rejected Archives ({rejectedSuggestions.length})</span>
          </button>
        </div>

        <span className="text-xs text-gray-500 flex items-center space-x-1">
          <ArchiveIcon size={12} />
          <span>Historical Records</span>
        </span>
      </div>

      {/* List content */}
      <AnimatePresence mode="popLayout">
        {activeList.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]"
          >
            <div className="p-4 rounded-full bg-white/5 text-gray-500 mb-4 animate-pulse">
              {subTab === 'posted' ? <CheckCircle size={40} /> : <AlertOctagon size={40} />}
            </div>
            <h3 className="text-md font-semibold text-gray-300">
              {subTab === 'posted' ? 'No published items in archive' : 'No rejected items in archive'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {subTab === 'posted' 
                ? 'Go to suggestions queue, click "Mark Posted", and paste the live Twitter/X URL.' 
                : 'Suggestions you delete from the queue will be stored here.'}
            </p>
          </motion.div>
        ) : (
          <motion.div layout className="space-y-5">
            {activeList.map((suggestion) => (
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
