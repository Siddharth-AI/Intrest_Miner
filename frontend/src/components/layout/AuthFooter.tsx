"use client";

import { motion } from "framer-motion";
import type React from "react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export const AuthFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Theme detection
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <footer className="relative bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-transparent to-blue-50/30 dark:from-gray-800/30 dark:via-transparent dark:to-blue-900/10" />

        <div className="relative mx-auto max-w-7xl px-6 pb-8">
          {/* Enhanced Bottom Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-8 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              {/* Enhanced Copyright */}
              <div className="flex items-center space-x-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  © {currentYear} InterestMiner. All rights reserved.
                </p>
                <motion.div
                  className="hidden md:flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}>
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>System Operational</span>
                </motion.div>
              </div>

              {/* Enhanced Bottom Links */}
              <div className="flex items-center space-x-6">
                {[
                  { name: "Privacy", href: "/privacy-policy" },
                  { name: "Terms", href: "/terms-conditions" },
                  { name: "Support", href: "/support" },
                ].map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}>
                    <Link
                      to={link.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium">
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
          {/* Built with Love */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}>
            <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center justify-center space-x-1">
              <span>Built with</span>
              <motion.span
                className="text-red-500"
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}>
                ❤️
              </motion.span>
              <span>for marketers worldwide</span>
            </p>
          </motion.div>
        </div>
      </footer>
    </>
  );
};
