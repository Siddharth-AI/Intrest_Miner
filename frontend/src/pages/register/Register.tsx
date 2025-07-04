import RegisterForm from "@/components/RegisterForm";
import { Button } from "@/components/ui/button";
import { Menu, Pickaxe, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

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
            <button
              onClick={() => scrollToSection("features")}
              className="text-gray-500 hover:text-blue-400 transition-colors font-medium">
              Features
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-gray-500 hover:text-blue-400 transition-colors font-medium">
              Pricing
            </button>
            <button
              onClick={() => scrollToSection("testimonials")}
              className="text-gray-500 hover:text-blue-400 transition-colors font-medium">
              Reviews
            </button>
            <a
              href="/login"
              className="text-gray-500 hover:text-blue-400 transition-colors">
              <Button
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 backdrop-blur-sm hover:shadow-lg transition-all transform "
                style={{
                  background: `linear-gradient(135deg, hsl(221.2, 83.2%, 53.3%) 0%, hsl(262.1, 83.3%, 57.8%) 100%)`,
                }}>
                Start Free Trial
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white bg-blue-500 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/20 py-4 space-y-4 bg-white backdrop-blur-sm rounded-b-lg mt-2">
            <button
              onClick={() => scrollToSection("features")}
              className="block w-full text-left px-4 py-3 text-black/90 hover:text-blue-500 hover:bg-white/10 transition-colors rounded-lg mx-2">
              Features
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="block w-full text-left px-4 py-3 text-black/90 hover:text-blue-500 hover:bg-white/10 transition-colors rounded-lg mx-2">
              Pricing
            </button>
            <button
              onClick={() => scrollToSection("testimonials")}
              className="block w-full text-left px-4 py-3 text-black/90 hover:text-blue-500 hover:bg-white/10 transition-colors rounded-lg mx-2">
              Reviews
            </button>
            <div className="px-4 space-y-3 pt-2">
              <a href="/login" className="block">
                <Button
                  variant="ghost"
                  className="w-full text-black/90 hover:text-blue-500 border border-white/30 hover:border-white/50">
                  Sign In
                </Button>
              </a>
              <a href="/login" className="block">
                <Button className="w-full bg-white/20 hover:bg-white/30 text-black/90 border border-white/30 hover:border-white/50 backdrop-blur-sm">
                  Start Free Trial
                </Button>
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

const Register = () => {
  return (
    <>
      <div>
        <Header />
        <div className="flex-column items-center md:flex pt-28 pb-10 bg-gradient-to-br from-[#2d3748] to-[#3b82f6] overflow-hidden">
          {/* Left side content */}
          <div className="left-div lg:ml-16">
            <div className="flex flex-col h-screen w-full justify-center p-8 text-white relative">
              <div className="circel-animation">
                <span className="circle"></span>
                <span className="circle"></span>
                <span className="circle"></span>
                <span className="circle"></span>
                <span className="circle"></span>
              </div>

              <div className="relative z-10">
                <div className="mb-16">
                  <div className="flex items-center justify-center">
                    <div className="bg-[#f1f5f9] rounded-full p-3 mr-3 mt-1 shadow-lg">
                      <Pickaxe className="text-[#3b82f6]" />
                    </div>
                    <span className="text-5xl font-bold bg-gradient-to-r from-[#f1f5f9] to-[#84cc16] bg-clip-text text-transparent">
                      InterestMiner
                    </span>
                  </div>
                </div>

                {/* Chatbot Message Bubble */}
                <div className="mb-8 relative">
                  <div className="bg-[#f1f5f9]/10 backdrop-blur-sm rounded-2xl p-6 border border-[#f1f5f9]/20 shadow-xl">
                    <div className="flex items-start space-x-3">
                      <div className="bg-gradient-to-r from-[#3b82f6] to-[#84cc16] rounded-full p-2 flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-[#f1f5f9]"
                          viewBox="0 0 24 24"
                          fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.97 4.29L1 23l6.71-1.97C9.02 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
                          <circle cx="8.5" cy="10.5" r="1.5" />
                          <circle cx="15.5" cy="10.5" r="1.5" />
                          <path d="M12 16c-1.1 0-2-.9-2 0h4c0 1.1-.9 2-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[#84cc16] mb-1">
                          AI Assistant
                        </div>
                        <p className="text-[#f1f5f9]/90 leading-relaxed">
                          {
                            "Tell us about your interests and we'll generate highly targeted ad campaigns just for you! 🎯"
                          }
                        </p>
                      </div>
                    </div>
                    {/* Message bubble tail */}
                    <div className="absolute -bottom-2 left-8 w-4 h-4 bg-[#f1f5f9]/10 rotate-45 border-r border-b border-[#f1f5f9]/20"></div>
                  </div>
                </div>

                <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#f1f5f9] to-[#84cc16] bg-clip-text text-transparent">
                  Hey, Hello! 👋
                </h1>
                <h2 className="text-xl mb-6 text-[#84cc16]">
                  Smart AI-Powered Interest Discovery
                </h2>

                <div className="space-y-4">
                  <p className="text-lg opacity-90 leading-relaxed">
                    Our intelligent chatbot analyzes your preferences and
                    automatically generates
                    <span className="text-[#84cc16] font-semibold">
                      {" "}
                      hyper-targeted Facebook ad interests
                    </span>
                    to boost your campaign performance.
                  </p>

                  <div className="flex items-center space-x-2 text-[#84cc16]">
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Reduce ad costs by up to 40%</span>
                  </div>

                  <div className="flex items-center space-x-2 text-[#84cc16]">
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>AI-powered audience insights</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <RegisterForm />
        </div>
      </div>
    </>
  );
};

export default Register;
