"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Globe,
  Wrench,
  Trophy,
  Users,
  Rocket,
  CheckCircle,
  Sparkles,
  Target,
  BarChart3,
  PartyPopper,
  Star,
  Heart,
} from "lucide-react";

import Portal from "../ui/Portal";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const steps = [
    {
      id: 1,
      title: "What is InterestMiner?",
      subtitle: "AI-Powered Facebook Ads Platform",
      description:
        "InterestMiner transforms Facebook advertising with AI-powered insights. Discover high-performing audiences, optimize campaigns, and maximize ROI through intelligent data analysis.",
      icon: Globe,
      color: "from-blue-500 to-blue-600",
      keyPoints: [
        "AI-powered keyword research",
        "Real-time Meta Ads integration",
        "Performance analytics of campaigns",
        "AI-powered recommendation",
      ],
      details: [
        "Connect your Facebook Business account seamlessly",
        "Access real-time campaign data and performance metrics",
        "Discover audience interests your competitors don't know",
        "Get AI recommendations for better performance",
      ],
    },
    {
      id: 2,
      title: "Advanced Tools & Technology",
      subtitle: "Cutting-Edge AI Solutions",
      description:
        "Our platform uses advanced AI algorithms and real-time integrations to give you the competitive edge in Facebook advertising.",
      icon: Wrench,
      color: "from-purple-500 to-purple-600",
      keyPoints: [
        "Meta Marketing API integration",
        "AI interest discovery algorithms",
        "Real-time performance tracking",
        "Automated optimization",
      ],
      details: [
        "AI Interest Discovery: Find high-performing audience segments",
        "Real-time Sync: Live data from Facebook Ads Manager",
        "Performance Analytics: Track all key metrics in one dashboard",
        "Smart Recommendations: Get expert optimization suggestions",
      ],
    },
    {
      id: 3,
      title: "Key Benefits",
      subtitle: "Transform Your Advertising",
      description:
        "Experience dramatic improvements in Facebook ad performance with measurable results that directly impact your bottom line.",
      icon: Trophy,
      color: "from-green-500 to-green-600",
      keyPoints: [
        "Reduce ad spend by up to 40%",
        "Save 10+ hours weekly",
        "Improve ROI significantly",
        "Access professional tools",
      ],
      details: [
        "Cost Savings: Eliminate wasted spend through better targeting",
        "Time Efficiency: Automated research replaces manual work",
        "Better ROI: Data-driven targeting increases conversions",
        "Expert Tools: Professional optimization without specialists",
      ],
    },
    {
      id: 4,
      title: "Who Benefits Most?",
      subtitle: "Perfect for Every Business",
      description:
        "InterestMiner delivers value across all business types and sizes, from solo entrepreneurs to enterprise campaigns.",
      icon: Users,
      color: "from-orange-500 to-orange-600",
      keyPoints: [
        "E-commerce businesses",
        "Digital marketing agencies",
        "Small-medium businesses",
        "Performance marketers",
      ],
      details: [
        "E-commerce: Boost sales with precise audience targeting",
        "Agencies: Manage multiple campaigns with professional tools",
        "SMBs: Enterprise-level optimization without the budget",
        "Marketers: Access advanced targeting strategies",
      ],
    },
    {
      id: 5,
      title: "Ready to Get Started?",
      subtitle: "Transform Your Ads Today",
      description:
        "Join thousands of successful businesses using InterestMiner to maximize ROI and achieve consistent advertising success.",
      icon: Rocket,
      color: "from-emerald-500 to-emerald-600",
      keyPoints: [
        "Instant AI-powered insights",
        "30-day money-back guarantee",
        "Setup in under 5 minutes",
        "24/7 customer support",
      ],
      details: [
        "Quick Setup: Connect Facebook and start immediately",
        "Risk-Free: Full money-back guarantee",
        "Fast Results: See improvements within 24 hours",
        "Expert Support: Get help from advertising specialists",
      ],
    },
  ];

  // Confetti animation function
  // Confetti animation function
  const launchConfetti = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confettiPieces: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      rotation: number;
      rotationSpeed: number;
      color: string;
      size: number;
      shape: string;
    }> = [];

    const colors = [
      "#ff6b6b",
      "#4ecdc4",
      "#45b7d1",
      "#96ceb4",
      "#feca57",
      "#ff9ff3",
      "#54a0ff",
      "#5f27cd",
      "#00d2d3",
      "#ff9f43",
      "#10ac84",
      "#ee5a52",
      "#0abde3",
      "#3867d6",
    ];

    const shapes = ["square", "circle", "triangle", "heart", "star"];

    // Create confetti pieces
    for (let i = 0; i < 150; i++) {
      confettiPieces.push({
        x: Math.random() * canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confettiPieces.forEach((piece, index) => {
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.vy += 0.1; // gravity
        piece.rotation += piece.rotationSpeed;

        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate((piece.rotation * Math.PI) / 180);
        ctx.fillStyle = piece.color;

        // Draw different shapes - Fixed ESLint error by wrapping cases in blocks
        switch (piece.shape) {
          case "square": {
            ctx.fillRect(
              -piece.size / 2,
              -piece.size / 2,
              piece.size,
              piece.size
            );
            break;
          }
          case "circle": {
            ctx.beginPath();
            ctx.arc(0, 0, piece.size / 2, 0, Math.PI * 2);
            ctx.fill();
            break;
          }
          case "triangle": {
            ctx.beginPath();
            ctx.moveTo(0, -piece.size / 2);
            ctx.lineTo(-piece.size / 2, piece.size / 2);
            ctx.lineTo(piece.size / 2, piece.size / 2);
            ctx.closePath();
            ctx.fill();
            break;
          }
          case "heart": {
            const size = piece.size / 4;
            ctx.beginPath();
            ctx.moveTo(0, size);
            ctx.bezierCurveTo(
              -size,
              -size / 2,
              -size * 2,
              size / 2,
              0,
              size * 2
            );
            ctx.bezierCurveTo(size * 2, size / 2, size, -size / 2, 0, size);
            ctx.fill();
            break;
          }
          case "star": {
            const spikes = 5;
            const outerRadius = piece.size / 2;
            const innerRadius = outerRadius / 2;
            ctx.beginPath();
            for (let i = 0; i < spikes; i++) {
              const angle = (i / spikes) * Math.PI * 2;
              const x = Math.cos(angle) * outerRadius;
              const y = Math.sin(angle) * outerRadius;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);

              const innerAngle = ((i + 0.5) / spikes) * Math.PI * 2;
              const innerX = Math.cos(innerAngle) * innerRadius;
              const innerY = Math.sin(innerAngle) * innerRadius;
              ctx.lineTo(innerX, innerY);
            }
            ctx.closePath();
            ctx.fill();
            break;
          }
          default: {
            // Default to square if shape is unknown
            ctx.fillRect(
              -piece.size / 2,
              -piece.size / 2,
              piece.size,
              piece.size
            );
            break;
          }
        }

        ctx.restore();

        // Remove pieces that are off screen
        if (piece.y > canvas.height + 10) {
          confettiPieces.splice(index, 1);
        }
      });

      if (confettiPieces.length > 0) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, []);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps((prev) => [...prev, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGetStarted = () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setCompletedSteps((prev) => [...prev, currentStep]);
    setShowCelebration(true);

    // Launch confetti
    launchConfetti();

    setTimeout(() => {
      setShowCelebration(false);
      setIsProcessing(false);
      onClose();
    }, 4000);
  };

  const handleSkip = () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setShowCelebration(true);

    // Launch confetti
    launchConfetti();

    setTimeout(() => {
      setShowCelebration(false);
      setIsProcessing(false);
      onClose();
    }, 4000);
  };

  // Enhanced celebration component with confetti and party animations
  const EnhancedCelebration = () => (
    <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-md flex items-center justify-center">
      {/* Canvas for confetti */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
      />

      {/* Floating party elements */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`party-${i}`}
          className="absolute"
          initial={{
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 50,
            rotate: 0,
            scale: 0,
          }}
          animate={{
            y: -50,
            rotate: 360,
            scale: [0, 1, 1, 0],
            x: Math.random() * window.innerWidth,
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 2,
            ease: "easeOut",
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: "100%",
          }}>
          <div
            className={`text-2xl ${
              i % 5 === 0
                ? "🎉"
                : i % 5 === 1
                ? "🎊"
                : i % 5 === 2
                ? "⭐"
                : i % 5 === 3
                ? "💫"
                : "🌟"
            }`}>
            {i % 5 === 0
              ? "🎉"
              : i % 5 === 1
              ? "🎊"
              : i % 5 === 2
              ? "⭐"
              : i % 5 === 3
              ? "💫"
              : "🌟"}
          </div>
        </motion.div>
      ))}

      {/* Sparkle effects */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute"
          initial={{ scale: 0, rotate: 0 }}
          animate={{
            scale: [0, 1, 1, 0],
            rotate: [0, 180, 360],
            x: [0, Math.random() * 100 - 50, Math.random() * 200 - 100],
            y: [0, Math.random() * 100 - 50, Math.random() * 200 - 100],
          }}
          transition={{
            duration: 2,
            delay: Math.random() * 3,
            repeat: Infinity,
            repeatDelay: Math.random() * 2,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}>
          <Sparkles className="w-6 h-6 text-yellow-400" />
        </motion.div>
      ))}

      {/* Main celebration content */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          delay: 0.2,
        }}
        className="relative z-20 text-center rounded-3xl p-10 max-w-md mx-4">
        <motion.div
          className="mb-6"
          animate={{
            rotate: [0, -10, 10, -10, 0],
            scale: [1, 1.1, 1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1,
          }}>
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center relative">
            <PartyPopper className="w-10 h-10 text-white" />

            {/* Pulsing ring effect */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-green-400"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>

        <motion.h2
          className="text-3xl font-bold text-white mb-4"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}>
          Welcome to InterestMiner! 🎉
        </motion.h2>

        <p className="text-white mb-6">
          You're all set to transform your Facebook advertising!
        </p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <motion.div
            className="text-center"
            whileHover={{ scale: 1.1 }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0 }}>
            <div className="text-2xl mb-1">🚀</div>
            <p className="text-sm text-white">Better ROI</p>
          </motion.div>

          <motion.div
            className="text-center"
            whileHover={{ scale: 1.1 }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}>
            <div className="text-2xl mb-1">⚡</div>
            <p className="text-sm text-white">Save Time</p>
          </motion.div>

          <motion.div
            className="text-center"
            whileHover={{ scale: 1.1 }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}>
            <div className="text-2xl mb-1">💎</div>
            <p className="text-sm text-white">AI Insights</p>
          </motion.div>
        </div>

        <motion.div
          className="text-gray-500 text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}>
          Starting your dashboard...
        </motion.div>

        {/* Celebration burst effect */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`burst-${i}`}
              className="absolute w-3 h-3 bg-yellow-400 rounded-full"
              style={{
                left: "50%",
                top: "50%",
                marginLeft: "-6px",
                marginTop: "-6px",
              }}
              animate={{
                x: Math.cos((i / 8) * Math.PI * 2) * 100,
                y: Math.sin((i / 8) * Math.PI * 2) * 100,
                scale: [0, 1, 0],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 1.5,
                delay: 0.5,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );

  if (!isOpen) return null;

  const IconComponent = steps[currentStep].icon;

  return (
    <>
      <Portal>
        <AnimatePresence>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="relative p-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white flex-shrink-0">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110">
                  <X className="w-5 h-5" />
                </button>

                {/* Step indicators */}
                <div className="flex justify-center items-center space-x-3">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div
                        className={`relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                          completedSteps.includes(index)
                            ? "bg-green-500 text-white scale-110"
                            : index === currentStep
                            ? "bg-white text-blue-600 scale-110 animate-pulse"
                            : "bg-white/20 text-white/70"
                        }`}>
                        {completedSteps.includes(index) ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <span className="font-bold">{step.id}</span>
                        )}
                      </div>

                      {index < steps.length - 1 && (
                        <div
                          className={`w-8 h-1 mx-2 rounded-full transition-all duration-500 ${
                            completedSteps.includes(index)
                              ? "bg-green-400"
                              : "bg-white/20"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="flex items-start space-x-6">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-r ${steps[currentStep].color} flex items-center justify-center shadow-lg`}>
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {steps[currentStep].title}
                    </h3>
                    <p className="text-lg text-blue-600 font-semibold mb-4">
                      {steps[currentStep].subtitle}
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      {steps[currentStep].description}
                    </p>

                    {/* Key Points */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <Target className="w-4 h-4 mr-2 text-blue-600" />
                        Key Features
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {steps[currentStep].keyPoints.map((point, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div
                              className={`w-2 h-2 rounded-full bg-gradient-to-r ${steps[currentStep].color}`}
                            />
                            <span className="text-gray-700 text-sm font-medium">
                              {point}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Details */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <BarChart3 className="w-4 h-4 mr-2 text-purple-600" />
                        What You Get
                      </h4>
                      <div className="space-y-3">
                        {steps[currentStep].details.map((detail, index) => (
                          <div
                            key={index}
                            className="p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
                <div className="flex justify-between items-center">
                  {/* Left buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSkip}
                      disabled={isProcessing}
                      className={`px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors rounded-lg ${
                        isProcessing
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-200"
                      }`}>
                      Skip Tour
                    </button>
                    {currentStep > 0 && (
                      <button
                        onClick={prevStep}
                        disabled={isProcessing}
                        className={`flex items-center space-x-2 px-4 py-2 bg-gray-200 rounded-lg transition-colors ${
                          isProcessing
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-300"
                        }`}>
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>
                    )}
                  </div>

                  {/* Right side */}
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
                      {currentStep + 1} of {steps.length}
                    </span>

                    {currentStep < steps.length - 1 ? (
                      <button
                        onClick={nextStep}
                        disabled={isProcessing}
                        className={`flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg transition-all shadow-lg font-medium ${
                          isProcessing
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:from-blue-700 hover:to-purple-700 hover:scale-105"
                        }`}>
                        <span>Next Step</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleGetStarted}
                        disabled={isProcessing}
                        className={`flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg transition-all shadow-lg font-semibold ${
                          isProcessing
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:from-green-600 hover:to-emerald-700 hover:scale-105"
                        }`}>
                        <Rocket className="w-5 h-5" />
                        <span>
                          {isProcessing ? "Starting..." : "Get Started!"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Enhanced Celebration with confetti */}
          {showCelebration && <EnhancedCelebration />}
        </AnimatePresence>
      </Portal>
    </>
  );
};

export default OnboardingModal;
