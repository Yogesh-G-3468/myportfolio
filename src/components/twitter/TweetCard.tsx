"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Trash2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  FileText,
  AlertCircle,
  CornerDownRight,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import { Suggestion } from '../../lib/twitterTypes';

interface TweetCardProps {
  suggestion: Suggestion;
  onSave: (id: number, tweets: string[]) => Promise<void>;
  onReject: (id: number) => Promise<void>;
  onMarkPosted: (id: number) => void;
}

export const TweetCard: React.FC<TweetCardProps> = ({
  suggestion,
  onSave,
  onReject,
  onMarkPosted,
}) => {
  const [tweets, setTweets] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showQualityGate, setShowQualityGate] = useState(true);

  // Initialize tweets state
  useEffect(() => {
    setTweets(suggestion.tweets);
  }, [suggestion.tweets]);

  // Track if text has changed compared to original suggestion
  useEffect(() => {
    const hasChanged = JSON.stringify(tweets) !== JSON.stringify(suggestion.tweets);
    setIsDirty(hasChanged);
  }, [tweets, suggestion.tweets]);

  const handleTweetChange = (index: number, newText: string) => {
    const updated = [...tweets];
    updated[index] = newText;
    setTweets(updated);
  };

  const handleApplySuggestedEdit = () => {
    if (suggestion.quality_gate.suggested_edit) {
      // For threads, if a suggested edit is present, we might apply it to the first tweet, 
      // or replace the whole thing if it's a single tweet.
      if (suggestion.format === 'single_tweet') {
        setTweets([suggestion.quality_gate.suggested_edit]);
      } else {
        // For threads, apply the edit to the first tweet, or split if it contains thread delimiters
        const edits = suggestion.quality_gate.suggested_edit.split('\n\n---');
        if (edits.length > 1) {
          setTweets(edits.map(e => e.trim()));
        } else {
          const updated = [...tweets];
          updated[0] = suggestion.quality_gate.suggested_edit;
          setTweets(updated);
        }
      }
    }
  };

  const handleSave = async () => {
    // Prevent saving if character count exceeded
    if (hasExceededLimit) return;
    setSaving(true);
    try {
      await onSave(suggestion.id, tweets);
      setIsDirty(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (confirm('Are you sure you want to reject this suggestion? It will be moved to the archive.')) {
      setRejecting(true);
      try {
        await onReject(suggestion.id);
      } catch (err) {
        console.error(err);
      } finally {
        setRejecting(false);
      }
    }
  };

  // Check if any tweet exceeds 280 characters
  const getTweetLengthStatus = (text: string) => {
    const length = text.length;
    const remaining = 280 - length;
    const isExceeded = remaining < 0;
    const isWarning = remaining >= 0 && remaining <= 20;
    return { length, remaining, isExceeded, isWarning };
  };

  const hasExceededLimit = tweets.some(t => t.length > 280);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative flex flex-col w-full bg-[#15202B]/40 border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden shadow-lg transition-all"
    >
      {/* Header bar: format, reasoning, and status */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-white/[0.02] border-b border-white/5">
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
            suggestion.format === 'thread'
              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
          }`}>
            <MessageSquare size={12} className="mr-1.5" />
            {suggestion.format === 'thread' ? 'Thread' : 'Single Tweet'}
          </span>

          {/* Reasoning pill */}
          <div className="flex items-center text-xs text-gray-400 max-w-md">
            <div className="p-1 rounded bg-white/5 text-cyan-400 mr-2 flex-shrink-0">
              <BrainCircuit size={12} />
            </div>
            <span className="truncate italic" title={suggestion.reasoning}>
              {suggestion.reasoning}
            </span>
          </div>
        </div>

        {/* Date / Timestamp */}
        {suggestion.created_at && (
          <span className="text-[11px] text-gray-500 font-medium">
            {new Date(suggestion.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Main content body */}
      <div className="p-5 flex flex-col md:flex-row gap-5">
        {/* Tweets List Column */}
        <div className="flex-1 flex flex-col space-y-4 relative">
          {tweets.map((tweetText, idx) => {
            const { length, remaining, isExceeded, isWarning } = getTweetLengthStatus(tweetText);

            return (
              <div key={idx} className="flex space-x-3.5 relative">
                {/* Visual Connector Line for Threads */}
                {suggestion.format === 'thread' && idx < tweets.length - 1 && (
                  <div className="absolute left-[17px] top-11 bottom-[-24px] w-[2px] bg-slate-700/50" />
                )}

                {/* Avatar Icon */}
                <div className="flex-shrink-0 z-10">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                    suggestion.format === 'thread'
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25'
                      : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25'
                  }`}>
                    {idx + 1}
                  </div>
                </div>

                {/* Textarea container */}
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <textarea
                      value={tweetText}
                      onChange={(e) => handleTweetChange(idx, e.target.value)}
                      rows={Math.max(3, Math.ceil(tweetText.length / 55))}
                      disabled={suggestion.status !== 'suggested'}
                      className={`w-full bg-[#15202B]/60 text-[15px] leading-relaxed text-white rounded-xl p-3 border resize-none focus:outline-none focus:ring-1 transition-all ${
                        isExceeded
                          ? 'border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/30'
                          : isWarning
                          ? 'border-amber-500/60 focus:border-amber-500 focus:ring-amber-500/30'
                          : 'border-white/10 focus:border-cyan-500 focus:ring-cyan-500/30'
                      }`}
                      placeholder="Enter tweet content..."
                    />

                    {/* Float character indicator */}
                    {suggestion.status === 'suggested' && (
                      <div className={`absolute bottom-2.5 right-3 text-[11px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-md transition-colors ${
                        isExceeded
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                          : isWarning
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-white/5 text-gray-400'
                      }`}>
                        {length} / 280
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quality Gate Sidebar Column */}
        {suggestion.status === 'suggested' && (
          <div className="w-full md:w-72 flex-shrink-0 flex flex-col bg-white/[0.01] border border-white/5 rounded-xl p-4 self-start">
            <button
              onClick={() => setShowQualityGate(!showQualityGate)}
              className="flex items-center justify-between text-xs font-semibold text-gray-400 mb-2.5 hover:text-white transition-colors cursor-pointer"
            >
              <span>Quality Gate Audit</span>
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                suggestion.quality_gate.approved
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-amber-500/10 text-amber-400'
              }`}>
                {suggestion.quality_gate.approved ? 'Passed' : 'Needs Review'}
              </span>
            </button>

            {showQualityGate && (
              <div className="space-y-3.5">
                {/* Specific checks */}
                {suggestion.quality_gate.checks && (
                  <div className="space-y-1.5">
                    {suggestion.quality_gate.checks.map((check, cIdx) => (
                      <div key={cIdx} className="flex items-start text-xs">
                        {check.passed ? (
                          <CheckCircle size={13} className="text-emerald-400 mt-0.5 mr-2 flex-shrink-0" />
                        ) : (
                          <AlertCircle size={13} className="text-rose-400 mt-0.5 mr-2 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <span className="font-semibold text-gray-300 block">{check.name}</span>
                          <span className="text-[10px] text-gray-500 leading-tight block">{check.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Warnings list */}
                {suggestion.quality_gate.warnings.length > 0 && (
                  <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-2.5">
                    <div className="flex items-center space-x-1.5 mb-1 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      <AlertTriangle size={12} />
                      <span>Tone & Policy Alerts</span>
                    </div>
                    <ul className="list-disc pl-3 text-[11px] text-amber-200/70 space-y-1">
                      {suggestion.quality_gate.warnings.map((w, wIdx) => (
                        <li key={wIdx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggested Edit block */}
                {suggestion.quality_gate.suggested_edit && (
                  <div className="border border-cyan-500/20 bg-cyan-500/[0.02] rounded-lg p-2.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-cyan-400 mb-1">
                      <div className="flex items-center space-x-1">
                        <Sparkles size={11} />
                        <span>Suggested Fix</span>
                      </div>
                      <button
                        onClick={handleApplySuggestedEdit}
                        className="text-[9px] font-bold uppercase bg-cyan-500/10 hover:bg-cyan-500/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        Apply Fix
                      </button>
                    </div>
                    <p className="text-[11px] text-cyan-100/75 leading-relaxed line-clamp-4 font-mono select-none">
                      {suggestion.quality_gate.suggested_edit}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions footer block */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-white/[0.01] border-t border-white/5">
        <div>
          {suggestion.status === 'suggested' && hasExceededLimit && (
            <span className="flex items-center space-x-1 text-xs text-rose-400 font-medium">
              <AlertCircle size={13} />
              <span>Cannot save. A tweet exceeds the 280-char limit.</span>
            </span>
          )}
        </div>

        <div className="flex space-x-3.5 ml-auto">
          {/* Reject button */}
          {suggestion.status === 'suggested' && (
            <button
              onClick={handleReject}
              disabled={rejecting || saving}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-red-500/35 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
              <span>{rejecting ? 'Rejecting...' : 'Reject'}</span>
            </button>
          )}

          {/* Edit/Save changes button */}
          {suggestion.status === 'suggested' && isDirty && (
            <button
              onClick={handleSave}
              disabled={saving || hasExceededLimit}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                hasExceededLimit
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                  : 'bg-cyan-500 text-[#0B0F19] hover:bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)] animate-pulse'
              }`}
            >
              <Save size={13} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          )}

          {/* Mark posted button */}
          {suggestion.status === 'suggested' && (
            <button
              onClick={() => onMarkPosted(suggestion.id)}
              disabled={saving || rejecting}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0B0F19] text-xs font-semibold transition-colors cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.15)]"
            >
              <CheckCircle size={13} />
              <span>Mark Posted</span>
            </button>
          )}

          {/* Posted URL display */}
          {suggestion.status === 'posted' && suggestion.posted_url && (
            <a
              href={suggestion.posted_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg border border-cyan-500/25 bg-cyan-500/5 text-xs text-cyan-400 hover:bg-cyan-500/10 transition-colors"
            >
              <span>View Published Post</span>
              <ExternalLink size={12} />
            </a>
          )}

          {/* Status indicators for Archives */}
          {suggestion.status === 'posted' && !suggestion.posted_url && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1.5">
              <CheckCircle size={14} />
              <span>Published</span>
            </span>
          )}

          {suggestion.status === 'rejected' && (
            <span className="text-xs text-rose-400 font-semibold flex items-center space-x-1.5">
              <AlertCircle size={14} />
              <span>Rejected</span>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
