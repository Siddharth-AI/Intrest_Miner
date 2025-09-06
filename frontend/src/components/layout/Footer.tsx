"use client";

import { motion } from "framer-motion";
import type React from "react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

// Simple icon components since lucide-react might not have all social icons
const TwitterIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM12 5.351c3.658 0 6.651 2.992 6.651 6.649 0 3.658-2.993 6.651-6.651 6.651-3.658 0-6.649-2.993-6.649-6.651C5.351 8.343 8.342 5.351 12 5.351zM12 16.154c2.206 0 4.007-1.8 4.007-4.007S14.206 8.14 12 8.14s-4.007 1.801-4.007 4.007S9.794 16.154 12 16.154z" />
  </svg>
);

const GithubIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.300 24 12c0-6.627-5.374-12-12-12z" />
  </svg>
);

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const footerLinks = {
    product: [
      { name: "Features", href: "/features" },
      { name: "Pricing", href: "/pricing" },
      { name: "API", href: "/api" },
      { name: "Documentation", href: "/docs" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Careers", href: "/careers" },
      { name: "Contact", href: "/contact" },
    ],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "Community", href: "/community" },
      { name: "Tutorials", href: "/tutorials" },
      { name: "Status", href: "/status" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Terms of Service", href: "/terms-conditions" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "GDPR", href: "/gdpr" },
    ],
  };

  const socialLinks = [
    {
      name: "Twitter",
      icon: TwitterIcon,
      href: "https://twitter.com",
      color: "hover:text-blue-400",
    },
    {
      name: "LinkedIn",
      icon: LinkedinIcon,
      href: "https://linkedin.com",
      color: "hover:text-blue-600",
    },
    {
      name: "Facebook",
      icon: FacebookIcon,
      href: "https://facebook.com",
      color: "hover:text-blue-500",
    },
    {
      name: "Instagram",
      icon: InstagramIcon,
      href: "https://instagram.com",
      color: "hover:text-pink-500",
    },
    {
      name: "GitHub",
      icon: GithubIcon,
      href: "https://github.com",
      color: "hover:text-gray-600 dark:hover:text-gray-300",
    },
  ];

  return (
    <>
      <footer className="relative bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-transparent to-blue-50/30 dark:from-gray-800/30 dark:via-transparent dark:to-blue-900/10" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-12 lg:px-16">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
            {/* Enhanced Brand Section */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}>
                {/* Logo with Animation */}
                <div className="flex items-center mb-6">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-xl flex items-center justify-center mr-4 shadow-lg"
                    whileHover={{
                      scale: 1.1,
                      rotate: [0, -5, 5, 0],
                    }}
                    transition={{ duration: 0.3 }}>
                    <span className="text-white font-bold text-lg">IM</span>
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                      InterestMiner
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      AI-Powered Marketing
                    </p>
                  </div>
                </div>

                {/* Enhanced Description */}
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                  AI-powered interest discovery platform that helps marketers
                  find winning Facebook ad audiences with precision targeting
                  and data-driven insights.
                </p>

                {/* Enhanced Social Links */}
                <div className="flex items-center space-x-4">
                  {socialLinks.map((social, index) => {
                    const IconComponent = social.icon;
                    return (
                      <motion.a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 ${social.color} transition-all duration-300 hover:shadow-md`}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}>
                        <IconComponent />
                      </motion.a>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Enhanced Footer Links */}
            {Object.entries(footerLinks).map(
              ([category, links], categoryIndex) => (
                <motion.div
                  key={category}
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize relative">
                    {category}
                    <motion.div
                      className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: "2rem" }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.8,
                        delay: categoryIndex * 0.1 + 0.3,
                      }}
                    />
                  </h3>
                  <ul className="space-y-3">
                    {links.map((link, linkIndex) => (
                      <motion.li
                        key={link.name}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.3,
                          delay: categoryIndex * 0.1 + linkIndex * 0.05,
                        }}>
                        <Link
                          to={link.href}
                          className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium hover:underline underline-offset-4 decoration-2 decoration-blue-600/30">
                          {link.name}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )
            )}
          </div>

          {/* Enhanced Bottom Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
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
