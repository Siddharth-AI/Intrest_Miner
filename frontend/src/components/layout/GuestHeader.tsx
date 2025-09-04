import { Button } from "@/components/ui/button";
import { Menu, Pickaxe, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

export default function GuestHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Effect to prevent scrolling when the menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    // Cleanup function to restore scrolling when the component unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const menuItems = [
    { label: "Features", sectionId: "features" },
    { label: "Growth", sectionId: "growth" },
    { label: "Reviews", sectionId: "testimonials" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/20 bg-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f1f5f9] to-[rgba(124,58,237,0.01)] shadow-lg" />
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-[70px]">
          {/* Brand */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30"
                style={{
                  background: `linear-gradient(135deg, hsl(221.2, 83.2%, 53.3%) 0%, hsl(262.1, 83.3%, 57.8%) 100%)`,
                }}>
                <Pickaxe className="w-6 h-6 text-white rounded-lg" />
              </div>
              <span
                className="text-2xl font-bold"
                style={{
                  background: `linear-gradient(135deg, hsl(221.2, 83.2%, 53.3%) 0%, hsl(262.1, 83.3%, 57.8%) 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                Interest-Miner
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/login"
              className="text-gray-500 hover:text-blue-400 transition-colors">
              <Button
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 backdrop-blur-sm hover:shadow-lg transition-all transform "
                style={{
                  background: `linear-gradient(135deg, hsl(221.2, 83.2%, 53.3%) 0%, hsl(262.1, 83.3%, 57.8%) 100%)`,
                }}>
                Start Free Trial
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white bg-blue-500 rounded-lg"
            onClick={() => setIsMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="fixed inset-0 z-[9999] bg-slate-900 text-white flex flex-col"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ ease: "easeInOut", duration: 0.3 }}>
              {/* Mobile Header */}
              <div className="flex items-center justify-between h-[70px] px-4 sm:px-6 lg:px-8 border-b border-slate-700">
                {/* MODIFICATION: Added onClick to close the menu */}
                <Link
                  to="/"
                  className="flex items-center space-x-3"
                  onClick={() => setIsMenuOpen(false)}>
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800">
                    <Pickaxe className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    Interest-Miner
                  </span>
                </Link>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-800 transition-colors"
                  aria-label="Close menu">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Menu Content */}
              <div className="flex flex-col items-center justify-center flex-1 p-6">
                <motion.div
                  className="flex flex-col items-center space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}>
                  {menuItems.map((item, index) => (
                    <motion.button
                      key={item.label}
                      // This already correctly closes the menu via the scrollToSection function
                      onClick={() => scrollToSection(item.sectionId)}
                      className="text-3xl font-medium text-slate-300 hover:text-blue-400 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}>
                      {item.label}
                    </motion.button>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="pt-6">
                    {/* MODIFICATION: Added onClick to the Link to close the menu */}
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button
                        size="lg"
                        className="bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold px-8 py-4 rounded-full transition-all transform hover:scale-105">
                        Start Free Trial
                      </Button>
                    </Link>
                  </motion.div>
                </motion.div>
              </div>

              <motion.footer
                className="text-center p-6 text-slate-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.3 }}>
                &copy; {new Date().getFullYear()} Interest-Miner. All rights
                reserved.
              </motion.footer>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
