"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, X, CheckCircle, AlertTriangle } from 'lucide-react';

interface PostedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string) => Promise<void>;
  suggestionId: number;
}

export const PostedModal: React.FC<PostedModalProps> = ({ isOpen, onClose, onConfirm, suggestionId }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    // Basic URL validation
    const twitterPattern = /^(https?:\/\/)?(www\.)?(twitter|x)\.com\/.+/i;
    if (!twitterPattern.test(url)) {
      setError('Please enter a valid Twitter/X URL (e.g., https://x.com/username/status/123)');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await onConfirm(url);
      setUrl('');
      onClose();
    } catch (err) {
      setError('Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F19]/95 p-6 shadow-2xl backdrop-blur-xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Globe size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Mark as Live Post</h3>
                <p className="text-xs text-gray-400">Connect this AI draft to your actual post</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="posted-url" className="block text-xs font-semibold text-gray-300 mb-2">
                  Live Tweet / Thread URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    id="posted-url"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="https://x.com/user/status/1801234567"
                    disabled={loading}
                    className="w-full bg-[#15202B]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                    autoFocus
                  />
                </div>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-1.5 mt-2 text-rose-400 text-xs"
                  >
                    <AlertTriangle size={14} />
                    <span>{error}</span>
                  </motion.div>
                )}
              </div>

              {/* Info note */}
              <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-3">
                <p className="text-xs text-cyan-200/80 leading-relaxed">
                  Adding the URL moves this item to the <strong>Archive (Posted)</strong> section and marks it as successfully published.
                </p>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/15 text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#0B0F19] text-sm font-semibold py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0B0F19] border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      <span>Mark Posted</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
