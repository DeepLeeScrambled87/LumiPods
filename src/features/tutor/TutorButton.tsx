import React, { useState } from 'react';
import { Bot, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AITutor } from './AITutor';

export const TutorButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
          >
            <Bot className="h-6 w-6" />
            {/* Pulse animation */}
            <span className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-25" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-xl"
          >
            <button
              onClick={() => setIsMinimized(false)}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-2 text-sm font-medium text-white"
            >
              <Bot className="h-4 w-4" />
              Reopen Lumi
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                setIsMinimized(false);
              }}
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Close Lumi"
              title="Close Lumi"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <AITutor
            isOpen={isOpen}
            onClose={() => {
              setIsOpen(false);
              setIsMinimized(false);
            }}
            onMinimize={() => setIsMinimized(true)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default TutorButton;
