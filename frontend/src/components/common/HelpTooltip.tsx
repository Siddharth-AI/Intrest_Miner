"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface HelpTooltipProps {
  show: boolean;
  onClose?: () => void;
  message?: string;
  duration?: number;
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({
  show,
  onClose,
  message = "How it works",
  duration = 6000,
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);

    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const tooltipElement = (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 15 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.9, x: 15 }}
          transition={{
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="fixed z-40"
          style={{
            bottom: "4.9rem",
            right: "calc(2rem + 47px)",
            position: "fixed",
          }}>
          <div className="relative flex items-center">
            <div
              className="text-white px-3 py-2 font-medium shadow-lg relative bg-indigo-600 flex items-center gap-2"
              style={{
                borderRadius: "12px",
                minWidth: "fit-content",
              }}>
              <span>{message}</span>

              {/* Perfect speech bubble tail */}
              <div
                className="absolute top-[37px] -right-1 transform -translate-y-1/2 rotate-[53deg] border-l-[18px] border-indigo-600"
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "12px solid transparent",
                  borderBottom: "12px solid transparent",
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return typeof document !== "undefined"
    ? createPortal(tooltipElement, document.body)
    : null;
};

export default HelpTooltip;
