import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function XPAnimation({ xp, show }) {
  if (!show || !xp) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={Date.now()}
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 0, y: -40 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="fixed bottom-8 right-8 text-primary font-syne font-bold text-xl z-50 pointer-events-none"
      >
        +{xp} XP
      </motion.div>
    </AnimatePresence>
  );
}