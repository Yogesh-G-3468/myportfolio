"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Inbox,
  Archive as ArchiveIcon,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Wifi,
  WifiOff,
  Cpu,
  Layers,
  CheckCircle,
  AlertTriangle,
  LogOut,
  Bell,
  Twitter,
  Github
} from 'lucide-react';

import { twitterApi, setMockMode, getMockMode } from '../../lib/twitterApi';
import { TrendTopic, Suggestion } from '../../lib/twitterTypes';
import { TrendScouts } from '../../components/twitter/TrendScouts';
import { ReviewQueue } from '../../components/twitter/ReviewQueue';
import { Archive } from '../../components/twitter/Archive';
import { PostedModal } from '../../components/twitter/PostedModal';

interface Toast {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  message: string;
}

export default function TwitterSystemPage() {
  // Navigation & View state
  const [activeView, setActiveView] = useState<'scouts' | 'review' | 'archive'>('scouts');
  const [reviewTab, setReviewTab] = useState<'suggested' | 'posted' | 'rejected'>('suggested');

  // API State
  const [isMockMode, setIsMockMode] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState<TrendTopic[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  // Modals & Notifications
  const [postedModalOpen, setPostedModalOpen] = useState(false);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Initialize and check backend status
  useEffect(() => {
    const initApp = async () => {
      setLoading(true);
      const isOnline = await twitterApi.checkBackend();
      setBackendOnline(isOnline);
      
      // If backend is online, default mock mode to false, otherwise true
      const initialMockMode = !isOnline;
      setMockMode(initialMockMode);
      setIsMockMode(initialMockMode);

      if (isOnline) {
        showToast('info', 'FastAPI Backend detected. Live mode activated.');
      } else {
        showToast('warning', 'FastAPI Backend offline. Fallback Mock Mode activated.');
      }

      await refreshData();
      setLoading(false);
    };

    initApp();
  }, []);

  // Fetch updated data from API layer
  const refreshData = async () => {
    try {
      const activeTopics = await twitterApi.getTopics();
      setTopics(activeTopics);

      const allSuggested = await twitterApi.getSuggestions('suggested');
      const allPosted = await twitterApi.getSuggestions('posted');
      const allRejected = await twitterApi.getSuggestions('rejected');
      
      // Merge all suggestions to maintain client filter state
      setSuggestions([...allSuggested, ...allPosted, ...allRejected]);
    } catch (err) {
      showToast('error', 'Failed to retrieve data from API.');
    }
  };

  // Toast notifier helper
  const showToast = (type: 'success' | 'warning' | 'info' | 'error', message: string) => {
    const newToast: Toast = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      message
    };
    setToasts((prev) => [newToast, ...prev]);
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  // Toggle Mock Mode explicitly
  const handleToggleMock = (val: boolean) => {
    setMockMode(val);
    setIsMockMode(val);
    refreshData();
    showToast('info', val ? 'Mock Mode activated' : 'Live API Mode activated (Target: http://localhost:8000)');
  };

  // Scan external trends
  const handleScanTrends = async () => {
    try {
      const updatedTopics = await twitterApi.scanTrends();
      setTopics(updatedTopics);
      showToast('success', 'External scanning completed! Hot topics updated.');
    } catch (err) {
      showToast('error', 'Error scanning trends. Try Mock Mode.');
    }
  };

  // Generate Draft using AI
  const handleGenerateDraft = async (topicId: number) => {
    try {
      const result = await twitterApi.generateContent(topicId);
      
      // Update topics list status locally
      setTopics(prev => prev.map(t => t.id === topicId ? { ...t, status: 'drafted' } : t));
      
      // Add suggestion to list
      setSuggestions(prev => [result, ...prev]);

      showToast('success', `Gemini drafted a new ${result.format === 'thread' ? 'thread' : 'tweet'}! Check Review Queue.`);
    } catch (err) {
      showToast('error', 'Generation failed. Make sure server is reachable.');
    }
  };

  // Save changes/edits on Suggestion card
  const handleSaveEdits = async (id: number, tweetsText: string[]) => {
    try {
      const updated = await twitterApi.updateSuggestion(id, { tweets: tweetsText });
      setSuggestions(prev => prev.map(s => s.id === id ? updated : s));
      showToast('success', 'Changes saved successfully.');
    } catch (err) {
      showToast('error', 'Failed to save changes.');
    }
  };

  // Reject / Soft delete suggestion
  const handleRejectSuggestion = async (id: number) => {
    try {
      await twitterApi.rejectSuggestion(id);
      setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: 'rejected' } : s));
      showToast('warning', 'Suggestion moved to Rejected archive.');
    } catch (err) {
      showToast('error', 'Could not reject suggestion.');
    }
  };

  // Click Mark Posted trigger
  const handleMarkPostedTrigger = (id: number) => {
    setSelectedSuggestionId(id);
    setPostedModalOpen(true);
  };

  // Confirm posted URL submit
  const handleConfirmPost = async (postedUrl: string) => {
    if (selectedSuggestionId === null) return;
    try {
      const updated = await twitterApi.updateSuggestion(selectedSuggestionId, {
        status: 'posted',
        posted_url: postedUrl
      });
      setSuggestions(prev => prev.map(s => s.id === selectedSuggestionId ? updated : s));
      showToast('success', 'Post marked as live and archived.');
    } catch (err) {
      showToast('error', 'Failed to update post status.');
      throw err;
    }
  };

  // Calculate badges counts
  const getCounts = () => {
    return {
      suggested: suggestions.filter(s => s.status === 'suggested').length,
      posted: suggestions.filter(s => s.status === 'posted').length,
      rejected: suggestions.filter(s => s.status === 'rejected').length
    };
  };

  const counts = getCounts();

  // Filter lists based on active subtab / section
  const getFilteredSuggestions = (status: 'suggested' | 'posted' | 'rejected') => {
    return suggestions.filter(s => s.status === status);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#e8e6e3] font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Header navbar */}
      <header className="sticky top-0 z-40 bg-[#0B0F19]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded-xl text-black flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Twitter size={20} className="fill-current text-[#0B0F19]" />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-tight text-white flex items-center space-x-1.5">
              <span>X-Scout AI</span>
              <span className="text-[10px] uppercase bg-cyan-500/10 text-cyan-400 font-bold px-1.5 py-0.5 rounded border border-cyan-500/20">v1.2</span>
            </h1>
            <p className="text-[10px] text-gray-400">Content Suggestion Engine</p>
          </div>
        </div>

        {/* Global Connection Controls */}
        <div className="flex items-center space-x-5">
          {/* Connection Indicator */}
          <div className="hidden sm:flex items-center space-x-2 bg-white/[0.02] border border-white/5 rounded-xl px-3 py-1.5">
            {backendOnline ? (
              <>
                <Wifi size={14} className="text-emerald-400" />
                <span className="text-[10px] font-semibold text-emerald-400 uppercase">FastAPI: Online</span>
              </>
            ) : (
              <>
                <WifiOff size={14} className="text-amber-500" />
                <span className="text-[10px] font-semibold text-amber-500 uppercase">FastAPI: Offline</span>
              </>
            )}
          </div>

          {/* Mock toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Mock API</span>
            <button
              onClick={() => handleToggleMock(!isMockMode)}
              className="text-cyan-400 focus:outline-none transition-colors cursor-pointer"
            >
              {isMockMode ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-gray-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 min-h-[calc(100vh-80px)]">
        {/* Left Sidebar Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0 flex flex-col space-y-2">
          <button
            onClick={() => setActiveView('scouts')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeView === 'scouts'
                ? 'bg-gradient-to-r from-cyan-500/10 to-transparent text-cyan-400 border-l-2 border-cyan-400 font-bold'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center space-x-3">
              <TrendingUp size={18} />
              <span>Trend Scouts</span>
            </div>
            <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded-full font-bold">
              {topics.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveView('review');
              setReviewTab('suggested');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeView === 'review'
                ? 'bg-gradient-to-r from-indigo-500/10 to-transparent text-indigo-400 border-l-2 border-indigo-400 font-bold'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Inbox size={18} />
              <span>Review Queue</span>
            </div>
            {counts.suggested > 0 && (
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                {counts.suggested}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveView('archive');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeView === 'archive'
                ? 'bg-gradient-to-r from-emerald-500/10 to-transparent text-emerald-400 border-l-2 border-emerald-400 font-bold'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center space-x-3">
              <ArchiveIcon size={18} />
              <span>Archive</span>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">
              {counts.posted + counts.rejected}
            </span>
          </button>

          {/* Quick instructions widget */}
          <div className="pt-8 mt-auto hidden md:block">
            <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 space-y-3.5">
              <h4 className="text-xs font-bold text-gray-300 flex items-center space-x-1.5">
                <Cpu size={14} className="text-cyan-400 animate-pulse" />
                <span>AI Workflow Helper</span>
              </h4>
              <ul className="text-[11px] text-gray-400 space-y-2 leading-relaxed list-decimal pl-4">
                <li>Scan for tech trends in <strong>Trend Scouts</strong>.</li>
                <li>Review Gemini-generated drafts in <strong>Review Queue</strong>.</li>
                <li>Edit drafts, review quality checks, and apply suggestions.</li>
                <li>Mark as posted to store in the historical archive.</li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Right Active View panel */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-40 space-y-4">
                  <div className="w-10 h-10 border-4 border-cyan-500/10 border-t-cyan-400 rounded-full animate-spin" />
                  <span className="text-xs font-medium text-gray-400">Loading system modules...</span>
                </div>
              ) : (
                <>
                  {activeView === 'scouts' && (
                    <TrendScouts
                      topics={topics}
                      onScan={handleScanTrends}
                      onGenerate={handleGenerateDraft}
                    />
                  )}

                  {activeView === 'review' && (
                    <ReviewQueue
                      suggestions={getFilteredSuggestions(reviewTab)}
                      activeTab={reviewTab}
                      onTabChange={setReviewTab}
                      onSave={handleSaveEdits}
                      onReject={handleRejectSuggestion}
                      onMarkPosted={handleMarkPostedTrigger}
                      counts={counts}
                    />
                  )}

                  {activeView === 'archive' && (
                    <Archive
                      suggestions={suggestions}
                      onSave={handleSaveEdits}
                      onReject={handleRejectSuggestion}
                      onMarkPosted={handleMarkPostedTrigger}
                    />
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Modals */}
      <PostedModal
        isOpen={postedModalOpen}
        onClose={() => {
          setPostedModalOpen(false);
          setSelectedSuggestionId(null);
        }}
        onConfirm={handleConfirmPost}
        suggestionId={selectedSuggestionId || 0}
      />

      {/* Toast notifications center */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`flex items-start p-4 rounded-xl border shadow-2xl backdrop-blur-xl ${
                t.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : t.type === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  : t.type === 'error'
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
              }`}
            >
              <div className="mr-3 mt-0.5">
                {t.type === 'success' && <CheckCircle size={16} />}
                {t.type === 'warning' && <AlertTriangle size={16} />}
                {t.type === 'error' && <AlertTriangle size={16} />}
                {t.type === 'info' && <Sparkles size={16} />}
              </div>
              <div className="flex-1 text-xs font-semibold leading-relaxed">
                {t.message}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
