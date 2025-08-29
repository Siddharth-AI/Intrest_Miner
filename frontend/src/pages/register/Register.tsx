import RegisterForm from "@/components/forms/RegisterForm";
import { Button } from "@/components/ui/button";
import { Menu, Pickaxe, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Register = () => {
  return (
    <>
      <div>
        <div className="flex-column items-center md:flex pt-28 pb-10 bg-gradient-to-br from-[#2d3748] to-[#3b82f6] overflow-hidden">
          {/* Left side content */}
          <div className="hidden md:block left-div lg:ml-16">
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
