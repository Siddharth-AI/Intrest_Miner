"use client";

import {
  motion,
  useAnimation,
  useSpring,
  useTransform,
  MotionValue,
  useInView,
} from "framer-motion";

import {
  FaRocket,
  FaChartLine,
  FaBrain,
  FaUsers,
  FaSearch,
  FaCog,
  FaCheck,
  FaComments,
  FaCode,
  FaChartBar,
  FaStar,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Brain, Menu, Pickaxe, Play, Rocket, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

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

const HeroSection = () => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (message.trim() !== "") {
      navigate("/login");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const ref = useRef(null);
  const inView = useInView(ref, {
    once: true,
    amount: 0.1,
  });

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#f1f5f9] to-[rgba(124,58,237,0.11)] py-28">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 relative">
          <div className="flex-1">
            <div className="text-center lg:text-left mb-4 mt-3">
              <span className="inline-flex text-[#3b82f6] font-medium mb-1 items-center">
                <Rocket className="w-5 h-5 mr-2 animate-bounce" />
                AI-Powered Campaign Generation
              </span>
            </div>

            <motion.div
              ref={ref}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={staggerContainer}
              className="text-center lg:text-left">
              <motion.h1
                variants={fadeInUp}
                className="text-5xl md:text-7xl font-bold mb-6 text-[#111827]">
                Create{" "}
                <span
                  style={{
                    background: `linear-gradient(135deg, hsl(221.2, 83.2%, 53.3%) 0%, hsl(262.1, 83.3%, 57.8%) 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}>
                  Winning
                </span>{" "}
                Ad Campaigns in Minutes
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl text-gray-500 mb-8">
                The only tool that guarantees profitable Facebook ad targeting
                for ecommerce. Our AI has analyzed $500M+ in successful
                campaigns to find winning interests that your competitors don't
                know about.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Link to="/login">
                  <Button
                    size="lg"
                    className="text-white hover:shadow-xl transition-all transform hover:scale-105 text-lg px-8 py-4"
                    style={{
                      background: `linear-gradient(135deg, hsl(221.2, 83.2%, 53.3%) 0%, hsl(262.1, 83.3%, 57.8%) 100%)`,
                    }}>
                    <Rocket className="w-5 h-5 mr-2" />
                    Start Free Trial
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/80 backdrop-blur-sm border-white/40 hover:bg-white hover:shadow-lg transition-all text-lg px-8 py-4">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex items-center gap-8 text-sm text-[#2d3748] mb-12 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full border-2 border-white"></div>
                  </div>
                  <span>Trusted by 25K+ ecommerce stores</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>4.9/5 rating</span>
                </div>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center py-4 bg-[#f1f5f9] rounded-sm shadow-xl">
                <div>
                  <div className="text-3xl font-bold text-[#111827] mb-2">
                    $127M+
                  </div>
                  <div className="text-sm text-[#2d3748]">
                    Revenue Generated
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#111827] mb-2">
                    40%
                  </div>
                  <div className="text-sm text-[#2d3748]">
                    Avg. Cost Reduction
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#3b82f6] mb-2">
                    320%
                  </div>
                  <div className="text-sm text-[#2d3748]">
                    Avg. ROI Increase
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          <motion.div variants={fadeInUp} className="flex-1 justify-end">
            <div className="bg-[#f1f5f9] rounded-2xl shadow-2xl p-6 max-w-lg mx-auto">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[#f1f5f9]"
                    style={{
                      background: `linear-gradient(135deg, hsl(221.2, 83.2%, 40.3%) 0%, hsl(262.1, 83.3%, 60.8%) 100%)`,
                    }}>
                    <FaBrain className="text-xl" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-[#2d3748]/10 rounded-2xl p-4">
                      <p className="text-[#2d3748]">
                        Can you help me create an ad campaign for my business?
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 justify-end">
                  <div className="flex-1">
                    <div className="bg-[#3b82f6]/10 rounded-2xl p-4">
                      <p className="text-[#3b82f6]">
                        I'd love to help! What kind of business do you run?
                      </p>
                    </div>
                  </div>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[#f1f5f9]"
                    style={{
                      background: `linear-gradient(135deg, hsl(221.2, 83.2%, 40.3%) 0%, hsl(262.1, 83.3%, 60.8%) 100%)`,
                    }}>
                    <FaRocket className="text-xl" />
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[#f1f5f9]"
                    style={{
                      background: `linear-gradient(135deg, hsl(221.2, 83.2%, 40.3%) 0%, hsl(262.1, 83.3%, 60.8%) 100%)`,
                    }}>
                    <FaBrain className="text-xl" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-[#2d3748]/10 rounded-2xl p-4">
                      <p className="text-[#2d3748]">
                        I run an online store selling eco-friendly products
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 justify-end">
                  <div className="flex-1">
                    <div className="bg-[#3b82f6]/10 rounded-2xl p-4">
                      <p className="text-[#3b82f6]">
                        Great choice! I'll analyze the eco-friendly market and
                        find the perfect audience interests for your campaign.
                        What's your target age group?
                      </p>
                    </div>
                  </div>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[#f1f5f9]"
                    style={{
                      background: `linear-gradient(135deg, hsl(221.2, 83.2%, 40.3%) 0%, hsl(262.1, 83.3%, 60.8%) 100%)`,
                    }}>
                    <FaRocket className="text-xl" />
                  </div>
                </div>
              </div>

              <div className="relative mt-6">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-3 rounded-lg border border-[#2d3748]/20 focus:outline-none focus:border-[#3b82f6]"
                />
                <button
                  onClick={handleSubmit}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#3b82f6] hover:text-[#2d3748]">
                  <FaRocket className="text-xl" />
                </button>
              </div>
            </div>
          </motion.div>
          <div className="overflow-hidden">
            <div className="-z-10 absolute top-[4.2rem] right-2 w-24 h-24 bg-gradient-to-b from-blue-500 to-purple-400 rounded-full opacity-30 animate-float"></div>
            <div
              className="-z-10 absolute bottom-4 right-[33rem] w-32 h-32 bg-gradient-to-r from-black to-purple-600 rounded-full opacity-20 animate-float"
              style={{ animationDelay: "2s" }}></div>
          </div>

          {/* Floating Elements */}
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: true,
    amount: 0.1,
  });

  const features = [
    {
      icon: FaComments,
      title: "AI Campaign Assistant",
      description:
        "Chat with our AI to discover your perfect audience and generate campaign ideas in real-time.",
      subFeatures: [
        "Natural language processing",
        "Industry-specific insights",
      ],
    },
    {
      icon: FaSearch,
      title: "Smart Interest Discovery",
      description:
        "Generate hundreds of targeted Facebook and Google ad interests based on your business profile.",
      subFeatures: ["500+ interests per campaign", "Real-time trend analysis"],
    },
    {
      icon: FaChartBar,
      title: "Performance Analytics",
      description:
        "Track campaign performance with detailed insights and AI-powered optimization recommendations.",
      subFeatures: ["Real-time dashboard", "Predictive insights"],
    },
    {
      icon: FaRocket,
      title: "Social Media Integration",
      description:
        "Seamlessly connect with Facebook, Google, and LinkedIn to launch campaigns directly from our platform.",
      subFeatures: ["One-click campaign launch", "Multi-platform management"],
    },
    {
      icon: FaCode,
      title: "Automated A/B Testing",
      description:
        "Let AI automatically test different ad variations and optimize for better performance.",
      subFeatures: ["Smart variant generation", "Statistical significance"],
    },
    {
      icon: FaCog,
      title: "Campaign Templates",
      description:
        "Choose from hundreds of proven campaign templates designed for different industries and goals.",
      subFeatures: ["Industry-specific templates", "Customizable frameworks"],
    },
  ];

  return (
    <section className="py-20 bg-[#f1f5f9]" id="features">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="text-center mb-16">
          <motion.h2
            variants={fadeInUp}
            className="text-4xl font-bold mb-4 text-[#111827]">
            Powered by{" "}
            <span
              style={{
                background: `linear-gradient(135deg, hsl(221.2, 83.2%, 53.3%) 0%, hsl(262.1, 83.3%, 57.8%) 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
              Advanced AI
            </span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-[#2d3748] max-w-3xl mx-auto">
            Our intelligent platform combines machine learning with real
            campaign data to optimize your advertising strategy.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-[#f1f5f9] rounded-xl p-8 shadow-lg transition-all duration-300 shadow-purple-100">
              <feature.icon className="text-4xl text-[#3b82f6] mb-6" />
              <h3 className="text-xl font-semibold mb-4 text-[#111827]">
                {feature.title}
              </h3>
              <p className="text-[#2d3748] mb-6">{feature.description}</p>
              <ul className="space-y-2">
                {feature.subFeatures.map((subFeature, subIndex) => (
                  <li
                    key={subIndex}
                    className="flex items-center text-[#2d3748] text-sm">
                    <FaCheck className="text-[#84cc16] mr-2" />
                    {subFeature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const StarRating = () => (
  <div className="flex gap-1 text-[#84cc16] mb-4">
    {[...Array(5)].map((_, i) => (
      <FaStar key={i} className="text-xl" />
    ))}
  </div>
);

const TestimonialsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: true,
    amount: 0.1,
  });

  const testimonials = [
    {
      quote:
        "Our Shopify store went from $50K to $300K monthly revenue using AdGenius AI targeting. The interests it discovered for our jewelry brand were perfect - our cost per acquisition dropped by 65%.",
      author: "Sarah Johnson",
      role: "Founder, Luna Jewelry Co.",
      revenue: "$2.1M Revenue",
      metric: "65% lower CPA",
      avatarColor: "bg-[#3b82f6]",
    },
    {
      quote:
        "As a dropshipping business, finding profitable audiences was our biggest challenge. AdGenius AI found winning interests that our competitors don't know about. Made $180K profit in 3 months.",
      author: "Michael Chen",
      role: "Ecommerce Entrepreneur",
      revenue: "$900K Revenue",
      metric: "$180K profit in 3 months",
      avatarColor: "bg-[#84cc16]",
    },
    {
      quote:
        "This tool single-handedly saved our fashion brand. We were burning money on ads until AdGenius AI showed us the right interests. Now we're scaling profitably at 4x ROAS.",
      author: "Emily Rodriguez",
      role: "CMO, StyleVault",
      revenue: "$1.5M Revenue",
      metric: "4x ROAS consistently",
      avatarColor: "bg-[#3b82f6]",
    },
    {
      quote:
        "Our supplement brand was struggling with Facebook ads. AdGenius AI found health & wellness interests that convert like crazy. Went from losing money to 6-figure months.",
      author: "David Park",
      role: "Founder, VitalBoost",
      revenue: "$850K Revenue",
      metric: "From losses to 6-figures",
      avatarColor: "bg-[#84cc16]",
    },
    {
      quote:
        "The targeting suggestions for our eco-friendly products were mind-blowing. Found audiences we never considered. Scaled from $10K to $80K monthly in 4 months with profitable ads.",
      author: "Lisa Thompson",
      role: "CEO, GreenChoice",
      revenue: "$480K Revenue",
      metric: "8x revenue growth",
      avatarColor: "bg-[#3b82f6]",
    },
    {
      quote:
        "Every ecommerce store owner needs this. The AI found interests that helped us scale our skincare brand to 7-figures. ROI went from negative to 320% positive.",
      author: "James Wilson",
      role: "Founder, PureSkin",
      revenue: "$1.8M Revenue",
      metric: "320% ROI turnaround",
      avatarColor: "bg-[#84cc16]",
    },
  ];

  return (
    <section className="py-20 bg-[#f1f5f9]" id="testimonials">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="text-center mb-16">
          <motion.h2
            variants={fadeInUp}
            className="text-4xl font-bold mb-4 text-[#111827]">
            Loved by{" "}
            <span
              style={{
                background: `linear-gradient(135deg, hsl(221.2, 83.2%, 53.3%) 0%, hsl(262.1, 83.3%, 57.8%) 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
              Marketing Teams
            </span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-[#2d3748] max-w-3xl mx-auto">
            See how AdGenius AI has transformed campaigns for thousands of
            businesses worldwide.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-[#f1f5f9] rounded-xl p-8 shadow-md shadow-purple-100">
              <StarRating />
              <p className="text-[#2d3748] mb-6 min-h-[120px]">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 ${testimonial.avatarColor} rounded-full flex items-center justify-center text-[#f1f5f9] text-lg font-semibold`}>
                  {testimonial.author.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-[#111827]">
                    {testimonial.author}
                  </h4>
                  <p className="text-sm text-[#2d3748]">{testimonial.role}</p>
                  <p className="text-sm text-[#2d3748]">
                    {testimonial.revenue}
                  </p>
                </div>
              </div>
              <div className="mt-4 bg-[#3b82f6]/10 text-[#3b82f6] py-2 px-4 rounded-full text-sm font-medium text-center">
                {testimonial.metric}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const SuccessStoriesSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: true,
    amount: 0.1,
  });

  const stories = [
    {
      company: "Luna Jewelry Co.",
      category: "Jewelry & Accessories",
      before: "50K",
      after: "300K",
      growth: "500%",
      period: "4 months",
      challenge: "High competition in jewelry market",
      solution: "AI discovered untapped vintage jewelry enthusiast audiences",
    },
    {
      company: "VitalBoost Supplements",
      category: "Health & Wellness",
      before: "25K",
      after: "150K",
      growth: "600%",
      period: "3 months",
      challenge: "Facebook kept rejecting health supplement ads",
      solution: "Found compliant wellness lifestyle interests that convert",
    },
    {
      company: "StyleVault Fashion",
      category: "Clothing & Apparel",
      before: "80K",
      after: "320K",
      growth: "400%",
      period: "5 months",
      challenge: "Saturated fashion market with high ad costs",
      solution:
        "Discovered micro-niches within fashion that competitors missed",
    },
  ];

  return (
    <section
      className="py-20 bg-gradient-to-br from-[#f1f5f9] to-[rgba(124,58,237,0.11)]"
      id="growth">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="text-center mb-16">
          <motion.h2
            variants={fadeInUp}
            className="text-4xl font-bold mb-4 text-[#111827]">
            Real{" "}
            <span
              style={{
                background: `linear-gradient(135deg, hsl(221.2, 83.2%, 53.3%) 0%, hsl(262.1, 83.3%, 57.8%) 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
              Success Stories
            </span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-[#2d3748] max-w-3xl mx-auto">
            See how ecommerce businesses transformed their ad performance with
            our AI targeting system.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-[#f1f5f9] rounded-xl overflow-hidden shadow-lg">
              <div
                className={`p-6 text-[#f1f5f9]`}
                style={{
                  background: `linear-gradient(135deg, hsl(221.2, 83.2%, 53.3%) 0%, hsl(262.1, 83.3%, 57.8%) 100%)`,
                }}>
                <h3 className="text-2xl font-bold mb-2">{story.company}</h3>
                <p className="opacity-90">{story.category}</p>
              </div>

              <div className="p-6">
                <div className="flex justify-between mb-6">
                  <div className="text-center">
                    <div className="text-[#2d3748] text-sm">Before</div>
                    <div className="text-2xl font-bold text-[#2d3748]">
                      ${story.before}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[#2d3748] text-sm">After</div>
                    <div className="text-2xl font-bold text-[#111827]">
                      ${story.after}
                    </div>
                  </div>
                </div>

                <div className="bg-[#3b82f6]/10 rounded-lg p-4 mb-6">
                  <div className="text-3xl font-bold text-[#3b82f6] mb-1">
                    {story.growth} Growth
                  </div>
                  <div className="text-[#2d3748]">
                    Achieved in {story.period}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-[#111827] font-semibold mb-2">
                      Challenge:
                    </h4>
                    <p className="text-[#2d3748]">{story.challenge}</p>
                  </div>
                  <div>
                    <h4 className="text-[#111827] font-semibold mb-2">
                      Solution:
                    </h4>
                    <p className="text-[#2d3748]">{story.solution}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const CallToActionSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: true,
    amount: 0.1,
  });

  return (
    <section className="py-20 bg-[#f1f5f9] ">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="text-center">
          <motion.h2
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-bold mb-6 text-black">
            Ready to Scale Your Ad Performance?
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-black/90 mb-12 max-w-3xl mx-auto">
            Join thousands of successful businesses using our AI-powered
            platform to discover winning ad interests and scale their
            campaigns.7y{" "}
          </motion.p>

          <motion.div variants={fadeInUp} className="flex justify-center gap-6">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-[#f1f5f9] px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300">
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 bg-black text-[#f1f5f9] hover:bg-[#111827] hover:text-[#f1f5f9] px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300">
              Schedule Demo
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const AnimatedCounter: React.FC<{
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}> = ({ end, duration = 2000, suffix = "", prefix = "" }) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  // Use Framer Motion's useSpring for smooth animation
  const motionValue = useSpring(0, {
    duration: duration,
    bounce: 0,
  });

  const rounded = useTransform(motionValue, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const unsubscribe = rounded.onChange(setDisplayValue);
    return unsubscribe;
  }, [rounded]);

  useEffect(() => {
    if (inView && !hasAnimated) {
      setHasAnimated(true);
      motionValue.set(end);
    }
  }, [inView, end, motionValue, hasAnimated]);

  return (
    <span ref={ref} className="text-3xl font-bold text-black tabular-nums">
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
};

// Optimized Statistics Section
const StatisticsSection: React.FC = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  const stats = [
    {
      icon: "👥",
      number: 50000,
      suffix: "+",
      label: "Active Users",
      description: "Marketers trust our platform",
    },
    {
      icon: "🔍",
      number: 2500000,
      suffix: "+",
      label: "Interest Searches",
      description: "Performed this month",
    },
    {
      icon: "📁",
      number: 125000,
      suffix: "+",
      label: "CSV Exports",
      description: "Downloaded for campaigns",
    },
    {
      icon: "💼",
      number: 98,
      suffix: "%",
      label: "Success Rate",
      description: "Campaign improvement",
    },
  ];

  return (
    <section
      className="py-16 bg-gradient-to-br from-[#f1f5f9] to-[rgba(124,58,237,0.11)]"
      ref={ref}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16">
          <h2 className="text-4xl font-bold text-black mb-4">
            Trusted by{" "}
            <span
              style={{
                background: `linear-gradient(135deg, hsl(221.2, 83.2%, 53.3%) 0%, hsl(262.1, 83.3%, 57.8%) 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
              Thousands
            </span>
          </h2>
          <p className="text-xl text-[#2d3748] max-w-3xl mx-auto">
            Join the growing community of successful marketers using
            InterestMiner
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={
                inView
                  ? {
                      opacity: 1,
                      scale: 1,
                      transition: {
                        delay: index * 0.1,
                        duration: 0.5,
                        ease: "easeOut",
                      },
                    }
                  : { opacity: 0, scale: 0.8 }
              }
              whileHover={{
                scale: 1,
                transition: { duration: 0.2 },
              }}
              className="text-center text-black bg-white backdrop-blur-sm rounded-2xl p-8 shadow-sm"
              style={{ willChange: "transform" }}>
              <div className="text-4xl mb-4">{stat.icon}</div>
              <div className="mb-2 text-black">
                <AnimatedCounter
                  end={stat.number}
                  suffix={stat.suffix}
                  duration={2000}
                />
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">
                {stat.label}
              </h3>
              <p className="text-blue-600 text-sm">{stat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export {
  Header,
  HeroSection,
  FeaturesSection,
  TestimonialsSection,
  SuccessStoriesSection,
  CallToActionSection,
  StatisticsSection,
};

const LandingPageSections = () => {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <StatisticsSection />
      <TestimonialsSection />
      <SuccessStoriesSection />
      <CallToActionSection />
    </>
  );
};

export default LandingPageSections;
