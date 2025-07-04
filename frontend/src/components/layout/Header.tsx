// "use client";

// import { useState, useRef, useEffect } from "react";
// import { GiMiner } from "react-icons/gi";
// import {
//   Pickaxe,
//   Search,
//   Bell,
//   User,
//   Menu,
//   LogOut,
//   Star,
//   X,
// } from "lucide-react"; // Added X for close icon
// import NotificationDropdown from "./NotificationDropdown";
// import { Link, useNavigate } from "react-router-dom";
// import PremiumMinerButton from "../ui/PremiumMinerButton";
// import PricingModel from "../PricingModel";

// export default function Header() {
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false); // State for mobile menu
//   const [isNotificationsOpen, setIsNotificationsOpen] =
//     useState<boolean>(false);
//   const [showPricingModal, setShowPricingModal] = useState<boolean>(false);
//   const router = useNavigate();
//   const mobileMenuRef = useRef<HTMLDivElement | null>(null); // Ref for mobile menu panel
//   const bellRef = useRef<HTMLButtonElement | null>(null);
//   const menuButtonRef = useRef<HTMLButtonElement | null>(null); // Ref for the menu button itself

//   const handleLogout = (): void => {
//     localStorage.clear();
//     router("/");
//   };

//   // Close mobile menu or notifications if clicked outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent): void => {
//       // Close mobile menu
//       if (
//         mobileMenuRef.current &&
//         !mobileMenuRef.current.contains(event.target as Node) &&
//         menuButtonRef.current &&
//         !menuButtonRef.current.contains(event.target as Node)
//       ) {
//         setIsMobileMenuOpen(false);
//       }
//       // Close notifications (handled by NotificationDropdown's internal logic, but good to keep consistent)
//       // This is generally redundant if NotificationDropdown uses its own portal and click outside logic.
//       // Keeping it here for demonstration of closing multiple dropdowns if needed.
//       if (
//         bellRef.current &&
//         !bellRef.current.contains(event.target as Node) &&
//         isNotificationsOpen &&
//         !(event.target as HTMLElement).closest(".notification-dropdown-portal") // Assuming a class on the portal root
//       ) {
//         setIsNotificationsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [isNotificationsOpen]); // Added isNotificationsOpen to dependency array for re-evaluation

//   // Prevent body scroll when mobile menu is open
//   useEffect(() => {
//     if (isMobileMenuOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "";
//     }
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [isMobileMenuOpen]);

//   const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
//   const profileButtonRef = useRef<HTMLButtonElement | null>(null);

//   return (
//     <div className="text-gray-100 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative z-40">
//       {" "}
//       {/* Increased z-index for header */}
//       {/* Animated background elements (can be adjusted for smaller screens if they become too intrusive) */}
//       <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse hidden sm:block"></div>{" "}
//       {/* Hide on small screens */}
//       <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000 hidden sm:block"></div>{" "}
//       {/* Hide on small screens */}
//       {/* Enhanced Navbar */}
//       <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 text-gray-100 py-4 px-6 flex items-center justify-between shadow-xl">
//         {/* Left Section: Logo and Welcome Message */}
//         <div className="flex items-center space-x-2 sm:space-x-4">
//           <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3 mr-2 sm:mr-3 shadow-lg hover:bg-white/30 transition-all duration-200">
//             <Link to="/dashboard">
//               <Pickaxe className="h-6 w-6 sm:h-7 sm:w-7" />{" "}
//               {/* Adjusted icon size */}
//             </Link>
//           </div>
//           <div className="hidden md:flex items-center">
//             {" "}
//             {/* Hide welcome message on small and medium screens */}
//             <span className="mr-3 text-xl sm:text-2xl">👋</span>
//             <div>
//               <span className="font-semibold text-white text-base sm:text-lg">
//                 Hi, Welcome Back!
//               </span>
//               <p className="text-sm text-gray-300 hidden lg:block">
//                 {" "}
//                 {/* Hide subtitle on medium screens */}
//                 Ready to discover new interests?
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Right Section: Main Navigation (Desktop) */}
//         <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
//           {" "}
//           {/* Hidden on small, shown on medium and up */}
//           <PremiumMinerButton onClick={() => setShowPricingModal(true)} />
//           <Link to="/dashboard">
//             <button
//               className="flex items-center gap-2 px-3 py-2 rounded-full
//               bg-gradient-to-r from-blue-400 to-purple-600
//               shadow-lg hover:shadow-2xl hover:from-yellow-500 hover:via-pink-600 hover:to-purple-700
//               text-white font-bold text-base uppercase tracking-wide {/* Reduced font size */}
//               relative
//               transition-all duration-200
//               border-2 border-yellow-300
//               focus:outline-none
//               group
//             "
//               style={{
//                 boxShadow: "0 2px 20px 0 rgba(236, 72, 153, 0.5)",
//               }}>
//               <span className="relative">
//                 <GiMiner
//                   size={20} // Reduced icon size
//                   className="text-gray-700 group-hover:text-purple-300"
//                 />
//               </span>
//               <span>Miner</span>
//             </button>
//           </Link>
//           <div className="relative">
//             <button
//               ref={bellRef}
//               onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
//               className="p-3 rounded-full hover:bg-purple-500/20 transition-all duration-200 group relative">
//               <Bell
//                 size={22}
//                 className="text-gray-300 group-hover:text-purple-300"
//               />
//               <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
//             </button>
//           </div>
//           <div className="relative">
//             <button
//               className="h-10 w-10 rounded-full flex items-center justify-center text-gray-300 hover:bg-blue-500/20 transition-all duration-200 group"
//               onClick={() => setShowProfileMenu((prev) => !prev)}
//               ref={profileButtonRef}>
//               <User size={22} className="group-hover:text-blue-300" />
//             </button>
//             {showProfileMenu && (
//               <div className="absolute -left-36 top-16 w-48 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl z-50 animate-fadeIn">
//                 <div className="p-3 relative">
//                   <button
//                     className="absolute top-[5px] right-1 p-2 text-gray-300  hover:bg-white/10 rounded-full flex items-center justify-end transition-all duration-200"
//                     onClick={() => setShowProfileMenu(false)}
//                     aria-label="Close profile menu">
//                     <X size={18} />
//                   </button>
//                 </div>

//                 <Link
//                   to="/profile"
//                   onClick={() => setShowProfileMenu(false)}
//                   className="flex mt-2 mx-1 py-2 items-center gap-3 text-gray-200 hover:text-white hover:bg-white/10 px-3 rounded-xl transition-all duration-200">
//                   <User size={18} />
//                   <span>Profile Settings</span>
//                 </Link>
//                 <hr className="border-white/10 my-1" />
//                 <button
//                   onClick={() => {
//                     setShowProfileMenu(false);
//                     handleLogout();
//                   }}
//                   className="flex mx-1 py-2 items-center gap-3 text-red-300 hover:text-red-200 hover:bg-red-500/10 px-3 mb-4 rounded-xl transition-all duration-200 w-full text-left">
//                   <LogOut size={18} />
//                   <span>Logout</span>
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Hamburger Menu Button (Mobile) */}
//         <div className="md:hidden flex items-center">
//           {" "}
//           {/* Shown only on small screens */}
//           <button
//             ref={menuButtonRef}
//             onClick={() => setIsMobileMenuOpen((prev) => !prev)}
//             className="p-3 rounded-full hover:bg-purple-500/20 transition-all duration-200 group relative"
//             aria-label="Open menu">
//             {isMobileMenuOpen ? (
//               <X size={24} className="text-gray-300" /> // Close icon
//             ) : (
//               <Menu
//                 size={24}
//                 className="text-gray-300 group-hover:text-purple-300"
//               /> // Hamburger icon
//             )}
//           </button>
//         </div>
//       </nav>
//       {/* Mobile Menu Panel */}
//       {isMobileMenuOpen && (
//         <div
//           ref={mobileMenuRef}
//           className="fixed inset-y-0 right-0 w-64 bg-white/10 backdrop-blur-lg border-l border-white/20 shadow-2xl z-50 py-6 px-4 animate-slideInRight md:hidden" // Only for mobile
//         >
//           <div className="flex justify-end mb-6">
//             <button
//               onClick={() => setIsMobileMenuOpen(false)}
//               className="p-2 rounded-full hover:bg-white/10 text-gray-300"
//               aria-label="Close menu">
//               <X size={24} />
//             </button>
//           </div>
//           <div className="space-y-4">
//             <PremiumMinerButton
//               onClick={() => {
//                 setShowPricingModal(true);
//                 setIsMobileMenuOpen(false); // Close mobile menu when opening modal
//               }}
//               className="w-full justify-center" // Center button text for mobile
//             />
//             <Link
//               to="/dashboard"
//               onClick={() => setIsMobileMenuOpen(false)}
//               className="flex items-center gap-3 text-white bg-gradient-to-r from-blue-400 to-purple-600 hover:from-yellow-500 hover:via-pink-600 hover:to-purple-700 p-3 rounded-xl transition-all duration-200 shadow-md">
//               <GiMiner size={20} />
//               <span>Miner</span>
//             </Link>
//             <button
//               onClick={() => {
//                 setIsNotificationsOpen(true);
//                 setIsMobileMenuOpen(false); // Close mobile menu when opening notifications
//               }}
//               className="flex items-center gap-3 text-gray-200 hover:text-white hover:bg-white/10 p-3 rounded-xl transition-all duration-200 w-full text-left">
//               <Bell size={18} />
//               <span>Notifications</span>
//             </button>
//             <Link
//               to="/profile"
//               onClick={() => setIsMobileMenuOpen(false)}
//               className="flex items-center gap-3 text-gray-200 hover:text-white hover:bg-white/10 p-3 rounded-xl transition-all duration-200">
//               <User size={18} />
//               <span>Profile Settings</span>
//             </Link>
//             <hr className="border-white/20 my-2" />
//             <button
//               onClick={handleLogout}
//               className="flex items-center gap-3 text-red-300 hover:text-red-200 hover:bg-red-500/10 p-3 rounded-xl transition-all duration-200 w-full text-left">
//               <LogOut size={18} />
//               <span>Logout</span>
//             </button>
//           </div>
//         </div>
//       )}
//       {/* Pricing Modal */}
//       {showPricingModal && (
//         <PricingModel onClose={() => setShowPricingModal(false)} />
//       )}
//       {/* Notification Dropdown - Using Portal for better z-index handling */}
//       <NotificationDropdown
//         isOpen={isNotificationsOpen}
//         onClose={() => setIsNotificationsOpen(false)}
//         triggerRef={bellRef}
//       />
//       {/* Custom Animations for Mobile Menu */}
//       <style>{`
//         @keyframes slideInRight {
//           from {
//             transform: translateX(100%);
//             opacity: 0;
//           }
//           to {
//             transform: translateX(0);
//             opacity: 1;
//           }
//         }
//         .animate-slideInRight {
//           animation: slideInRight 0.3s ease-out forwards;
//         }

//         /* Existing animations */
//         @keyframes pulse {
//           0%,
//           100% {
//             opacity: 0.1;
//           }
//           50% {
//             opacity: 0.2;
//           }
//         }
//         .animate-pulse {
//           animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
//         }
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: translateY(-10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.3s ease-out forwards;
//         }
//       `}</style>
//     </div>
//   );
// }

//------------------------------------------------------------------------------------------------------

// "use client";

// import { useState, useRef, useEffect } from "react";
// import { GiMiner } from "react-icons/gi";
// import { Pickaxe, Bell, User, Menu, LogOut, X } from "lucide-react";
// import NotificationDropdown from "./NotificationDropdown";
// // import Link from "next/link";
// // import { useRouter } from "next/navigation";
// import { Link, useNavigate } from "react-router-dom";
// import PremiumMinerButton from "../ui/PremiumMinerButton";
// import PricingModel from "../PricingModel";
// import { motion } from "framer-motion";

// export default function Header() {
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
//   const [isNotificationsOpen, setIsNotificationsOpen] =
//     useState<boolean>(false);
//   const [showPricingModal, setShowPricingModal] = useState<boolean>(false);

//   const router = useNavigate();
//   const mobileMenuRef = useRef<HTMLDivElement | null>(null);
//   const bellRef = useRef<HTMLButtonElement | null>(null);
//   const menuButtonRef = useRef<HTMLButtonElement | null>(null);

//   const handleLogout = (): void => {
//     localStorage.clear();
//     router("/");
//   };

//   // FIXED: Simplified click outside detection - removed notification dropdown logic from here
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent): void => {
//       // Only handle mobile menu click outside
//       if (
//         mobileMenuRef.current &&
//         !mobileMenuRef.current.contains(event.target as Node) &&
//         menuButtonRef.current &&
//         !menuButtonRef.current.contains(event.target as Node)
//       ) {
//         setIsMobileMenuOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []); // Removed isNotificationsOpen dependency

//   useEffect(() => {
//     if (isMobileMenuOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "";
//     }
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [isMobileMenuOpen]);

//   const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
//   const profileButtonRef = useRef<HTMLButtonElement | null>(null);

//   return (
//     <div
//       className="text-gray-100"
//       style={{
//         background: `linear-gradient(135deg, #2d3748 0%, #3b82f6 100%)`,
//       }}>
//       {/* Enhanced Navbar */}
//       <nav className="backdrop-blur-sm border-b border-[#2d3748]/20 text-gray-100 py-4 px-6 flex items-center justify-between shadow-xl">
//         {/* Left Section: Logo and Welcome Message */}
//         <div className="flex items-center space-x-2 sm:space-x-4">
//           <motion.div
//             className="bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3 mr-2 sm:mr-3 shadow-lg hover:bg-white/30 transition-all duration-200"
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}>
//             <Link to="/dashboard">
//               <Pickaxe className="h-6 w-6 sm:h-7 sm:w-7" />
//             </Link>
//           </motion.div>
//           <div className="hidden md:flex items-center">
//             <span className="mr-3 text-xl sm:text-2xl">👋</span>
//             <div>
//               <span className="font-semibold text-white text-base sm:text-lg">
//                 Hi, Welcome Back!
//               </span>
//               <p className="text-sm text-gray-300 hidden lg:block">
//                 Ready to discover new interests?
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Right Section: Main Navigation (Desktop) */}
//         <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
//           <PremiumMinerButton onClick={() => setShowPricingModal(true)} />
//           <Link to="/dashboard">
//             <motion.button
//               className="flex items-center gap-2 px-3 py-2 rounded-full
//               bg-gradient-to-r from-[#3b82f6] to-[#2563eb]
//               shadow-lg hover:shadow-2xl hover:from-[#2563eb] hover:to-[#1d4ed8]
//               text-white font-bold text-base uppercase tracking-wide
//               relative
//               transition-all duration-200
//               border-2 border-[#60a5fa]
//               focus:outline-none
//               group"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               style={{
//                 boxShadow: "0 2px 20px 0 rgba(59, 130, 246, 0.5)",
//               }}>
//               <span className="relative">
//                 <GiMiner
//                   size={20}
//                   className="text-white group-hover:text-[#f1f5f9]"
//                 />
//               </span>
//               <span>Miner</span>
//             </motion.button>
//           </Link>
//           <div className="relative">
//             <motion.button
//               ref={bellRef}
//               onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
//               className="p-3 rounded-full hover:bg-[#3b82f6]/20 transition-all duration-200 group relative"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}>
//               <Bell
//                 size={22}
//                 className="text-gray-300 group-hover:text-[#3b82f6]"
//               />
//               <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
//             </motion.button>
//           </div>
//           <div className="relative">
//             <motion.button
//               className="h-10 w-10 rounded-full flex items-center justify-center text-gray-300 hover:bg-[#3b82f6]/20 transition-all duration-200 group"
//               onClick={() => setShowProfileMenu((prev) => !prev)}
//               ref={profileButtonRef}
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}>
//               <User size={22} className="group-hover:text-[#3b82f6]" />
//             </motion.button>
//             {showProfileMenu && (
//               <motion.div
//                 className="absolute -left-36 top-16 w-48 bg-[#f1f5f9] border border-[#2d3748]/20 rounded-xl shadow-2xl z-50"
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//                 transition={{ duration: 0.2 }}>
//                 <div className="p-3 relative">
//                   <button
//                     className="absolute top-[5px] right-1 p-2 text-[#2d3748] hover:bg-[#3b82f6]/10 rounded-full flex items-center justify-end transition-all duration-200"
//                     onClick={() => setShowProfileMenu(false)}
//                     aria-label="Close profile menu">
//                     <X size={18} />
//                   </button>
//                 </div>

//                 <Link
//                   to="/profile"
//                   onClick={() => setShowProfileMenu(false)}
//                   className="flex mt-2 mx-1 py-2 items-center gap-3 text-[#2d3748] hover:text-[#111827] hover:bg-[#3b82f6]/10 px-3 rounded-xl transition-all duration-200">
//                   <User size={18} />
//                   <span>Profile Settings</span>
//                 </Link>
//                 <hr className="border-[#2d3748]/10 my-1" />
//                 <button
//                   onClick={() => {
//                     setShowProfileMenu(false);
//                     handleLogout();
//                   }}
//                   className="flex mx-1 py-2 items-center gap-3 text-red-600 hover:text-red-700 hover:bg-red-500/10 px-3 mb-4 rounded-xl transition-all duration-200 w-full text-left">
//                   <LogOut size={18} />
//                   <span>Logout</span>
//                 </button>
//               </motion.div>
//             )}
//           </div>
//         </div>

//         {/* Hamburger Menu Button (Mobile) */}
//         <div className="md:hidden flex items-center">
//           <motion.button
//             ref={menuButtonRef}
//             onClick={() => setIsMobileMenuOpen((prev) => !prev)}
//             className="p-3 rounded-full hover:bg-[#3b82f6]/20 transition-all duration-200 group relative"
//             aria-label="Open menu"
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}>
//             {isMobileMenuOpen ? (
//               <X size={24} className="text-gray-300" />
//             ) : (
//               <Menu
//                 size={24}
//                 className="text-gray-300 group-hover:text-[#3b82f6]"
//               />
//             )}
//           </motion.button>
//         </div>
//       </nav>

//       {/* Mobile Menu Panel */}
//       {isMobileMenuOpen && (
//         <motion.div
//           ref={mobileMenuRef}
//           className="fixed inset-y-0 right-0 w-64 bg-[#f1f5f9] border-l border-[#2d3748]/20 shadow-2xl z-50 py-6 px-4 md:hidden"
//           initial={{ x: "100%" }}
//           animate={{ x: 0 }}
//           exit={{ x: "100%" }}
//           transition={{ type: "spring", damping: 20, stiffness: 300 }}>
//           <div className="flex justify-end mb-6">
//             <button
//               onClick={() => setIsMobileMenuOpen(false)}
//               className="p-2 rounded-full hover:bg-[#3b82f6]/10 text-[#2d3748]"
//               aria-label="Close menu">
//               <X size={24} />
//             </button>
//           </div>
//           <div className="space-y-4">
//             <PremiumMinerButton
//               onClick={() => {
//                 setShowPricingModal(true);
//                 setIsMobileMenuOpen(false);
//               }}
//               className="w-full justify-center"
//             />
//             <Link
//               to="/dashboard"
//               onClick={() => setIsMobileMenuOpen(false)}
//               className="flex items-center gap-3 text-white bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] p-3 rounded-xl transition-all duration-200 shadow-md">
//               <GiMiner size={20} />
//               <span>Miner</span>
//             </Link>
//             <button
//               onClick={() => {
//                 setIsNotificationsOpen(true);
//                 setIsMobileMenuOpen(false);
//               }}
//               className="flex items-center gap-3 text-[#2d3748] hover:text-[#111827] hover:bg-[#3b82f6]/10 p-3 rounded-xl transition-all duration-200 w-full text-left">
//               <Bell size={18} />
//               <span>Notifications</span>
//             </button>
//             <Link
//               to="/profile"
//               onClick={() => setIsMobileMenuOpen(false)}
//               className="flex items-center gap-3 text-[#2d3748] hover:text-[#111827] hover:bg-[#3b82f6]/10 p-3 rounded-xl transition-all duration-200">
//               <User size={18} />
//               <span>Profile Settings</span>
//             </Link>
//             <hr className="border-[#2d3748]/20 my-2" />
//             <button
//               onClick={handleLogout}
//               className="flex items-center gap-3 text-red-600 hover:text-red-700 hover:bg-red-500/10 p-3 rounded-xl transition-all duration-200 w-full text-left">
//               <LogOut size={18} />
//               <span>Logout</span>
//             </button>
//           </div>
//         </motion.div>
//       )}

//       {/* Pricing Modal */}
//       {showPricingModal && (
//         <PricingModel onClose={() => setShowPricingModal(false)} />
//       )}

//       {/* Notification Dropdown */}
//       <NotificationDropdown
//         isOpen={isNotificationsOpen}
//         onClose={() => setIsNotificationsOpen(false)}
//         triggerRef={bellRef}
//       />
//     </div>
//   );
// }

"use client";

import { useState, useRef, useEffect } from "react";
import { GiMiner } from "react-icons/gi";
import {
  Pickaxe,
  Bell,
  User,
  Menu,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
import { Link, useNavigate } from "react-router-dom";
import PremiumMinerButton from "../ui/PremiumMinerButton";
import PricingModel from "../PricingModel";
import { motion } from "framer-motion";
export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] =
    useState<boolean>(false);
  const [showPricingModal, setShowPricingModal] = useState<boolean>(false);

  const router = useNavigate();
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const bellRef = useRef<HTMLButtonElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleLogout = (): void => {
    localStorage.clear();
    router("/");
  };

  // FIXED: Simplified click outside detection - removed notification dropdown logic from here
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      // Only handle mobile menu click outside
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []); // Removed isNotificationsOpen dependency

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const profileButtonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b-2 border-blue-300 bg-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f1f5f9] to-[rgba(124,58,237,0.01)] shadow-lg" />
      {/* Enhanced Navbar */}
      <nav className="container h-[70px] backdrop-blur-sm text-gray-100 py-4 px-6  flex items-center justify-between ">
        {/* Left Section: Logo and Welcome Message */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <motion.div
            className="bg-white/20 backdrop-blur-sm rounded-2xl p-2 sm:p-3 mr-2 sm:mr-3 shadow-lg hover:bg-white/30 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: `linear-gradient(135deg, hsl(221.2, 83.2%, 53.3%) 0%, hsl(262.1, 83.3%, 57.8%) 100%)`,
            }}>
            <Link to="/dashboard">
              <Pickaxe className="h-6 w-6 sm:h-7 sm:w-7" />
            </Link>
          </motion.div>
          <div className="hidden md:flex items-center">
            <span className="mr-3 text-xl sm:text-2xl">👋</span>
            <div>
              <span className="font-semibold text-black text-base sm:text-lg">
                Hi, Welcome Back!
              </span>
              <p className="text-sm text-gray-700 hidden lg:block">
                Ready to discover new interests?
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Main Navigation (Desktop) */}
        <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
          <PremiumMinerButton onClick={() => setShowPricingModal(true)} />
          <Link to="/dashboard">
            <motion.button
              className="flex items-center gap-2 px-3 py-2 rounded-full
              bg-gradient-to-r from-[#3b82f6] to-[#2563eb]
              shadow-lg hover:shadow-2xl hover:from-[#2563eb] hover:to-[#1d4ed8]
              text-white font-bold text-base uppercase tracking-wide
              relative
              transition-all duration-200
              border-2 border-[#60a5fa]
              focus:outline-none
              group"
              style={{
                boxShadow: "0 2px 20px 0 rgba(59, 130, 246, 0.5)",
              }}>
              <span className="relative">
                <GiMiner
                  size={20}
                  className="text-white group-hover:text-[#f1f5f9]"
                />
              </span>
              <span>Miner</span>
            </motion.button>
          </Link>
          <div className="relative">
            <motion.button
              ref={bellRef}
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-3 rounded-full hover:bg-blue-300 transition-all duration-200 group relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}>
              <Bell
                size={22}
                className="text-gray-500 group-hover:text-[#3b82f6]"
              />
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
            </motion.button>
          </div>
          <div className="relative">
            <motion.button
              className="h-10 w-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-blue-300 transition-all duration-200 group"
              onClick={() => setShowProfileMenu((prev) => !prev)}
              ref={profileButtonRef}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}>
              <User size={22} className="group-hover:text-[#3b82f6]" />
            </motion.button>
          </div>
        </div>

        {/* Hamburger Menu Button (Mobile) */}
        <div className="md:hidden flex items-center">
          <motion.button
            ref={menuButtonRef}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="p-3 rounded-full hover:bg-[#3b82f6]/20 transition-all duration-200 group relative"
            aria-label="Open menu"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}>
            {isMobileMenuOpen ? (
              <X size={24} className="text-gray-800" />
            ) : (
              <Menu
                size={24}
                className="text-gray-800 group-hover:text-[#3b82f6]"
              />
            )}
          </motion.button>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-white backdrop-blur-xl md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}>
          <motion.div
            ref={mobileMenuRef}
            className="fixed inset-0 bg-gradient-to-br from-[#f1f5f9] to-[rgba(59,131,246,0.11)] overflow-y-auto"
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}>
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#2d3748]/20">
              <div className="flex items-center space-x-3">
                <motion.div
                  className="bg-white/20 backdrop-blur-sm rounded-full p-3 shadow-lg"
                  whileHover={{ scale: 1.05 }}>
                  <Pickaxe className="h-7 w-7 text-[#3b82f6]" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-[#111827]">
                    Interest-Miner
                  </h2>
                  <p className="text-sm text-[#2d3748]">Menu</p>
                </div>
              </div>
              <motion.button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-full hover:bg-[#3b82f6]/10 text-[#2d3748] transition-colors"
                aria-label="Close menu"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}>
                <X size={28} />
              </motion.button>
            </div>

            {/* Mobile Menu Content */}
            <div className="flex-1 p-6">
              <div className="space-y-6">
                {/* Welcome Section */}
                {/* <motion.div
                  className="bg-[#f1f5f9] rounded-2xl p-6 border border-[#2d3748]/20 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-3xl">👋</span>
                    <div>
                      <h3 className="text-lg font-semibold text-[#111827]">
                        Welcome Back!
                      </h3>
                      <p className="text-sm text-[#2d3748]">
                        Ready to discover new interests?
                      </p>
                    </div>
                  </div>
                </motion.div> */}

                {/* Main Actions */}
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}>
                  <PremiumMinerButton
                    onClick={() => {
                      setShowPricingModal(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-center py-4 text-base"
                  />

                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-3 text-white bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] p-4 rounded-2xl transition-all duration-200 shadow-lg w-full">
                    <GiMiner size={24} />
                    <span className="text-lg font-semibold">Start Mining</span>
                  </Link>
                </motion.div>

                {/* Menu Items */}
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}>
                  <motion.button
                    onClick={() => {
                      setIsNotificationsOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-between w-full text-[#2d3748] hover:text-[#111827] hover:bg-[#3b82f6]/10 p-4 rounded-2xl transition-all duration-200 border border-[#2d3748]/20"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}>
                    <div className="flex items-center gap-3">
                      <div className="bg-[#3b82f6]/20 p-2 rounded-lg">
                        <Bell size={20} className="text-[#3b82f6]" />
                      </div>
                      <span className="text-base font-medium">
                        Notifications
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <ChevronRight size={20} />
                    </div>
                  </motion.button>

                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between text-[#2d3748] hover:text-[#111827] hover:bg-[#3b82f6]/10 p-4 rounded-2xl transition-all duration-200 border border-[#2d3748]/20">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#2563eb]/20 p-2 rounded-lg">
                        <User size={20} className="text-[#2563eb]" />
                      </div>
                      <span className="text-base font-medium">
                        Profile Settings
                      </span>
                    </div>
                    <ChevronRight size={20} />
                  </Link>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                  className="grid grid-cols-2 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}>
                  <div className="bg-[#f1f5f9] rounded-2xl p-4 border border-[#2d3748]/20 text-center">
                    <div className="text-2xl font-bold text-[#3b82f6] mb-1">
                      128
                    </div>
                    <div className="text-xs text-[#2d3748]">Searches</div>
                  </div>
                  <div className="bg-[#f1f5f9] rounded-2xl p-4 border border-[#2d3748]/20 text-center">
                    <div className="text-2xl font-bold text-[#2563eb] mb-1">
                      47
                    </div>
                    <div className="text-xs text-[#2d3748]">Exports</div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="p-6 border-t border-[#2d3748]/20 bg-[#f1f5f9]/50">
              <motion.button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex bg-red-500 items-center justify-center gap-3 text-white p-4 rounded-2xl transition-all duration-200 w-full border border-red-500/20">
                <LogOut size={20} />
                <span className="text-base font-medium">Logout</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Pricing Modal */}
      {showPricingModal && (
        <PricingModel onClose={() => setShowPricingModal(false)} />
      )}

      {showProfileMenu && (
        <motion.div
          className="absolute right-6 top-[4.5rem]  w-48 bg-[#f1f5f9] border border-[#2d3748]/20 rounded-xl shadow-2xl z-[1000]"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}>
          <div className="p-3 relative">
            <button
              className="absolute top-[5px] right-1 p-2 text-[#2d3748] hover:bg-[#3b82f6]/10 rounded-full flex items-center justify-end transition-all duration-200"
              onClick={() => setShowProfileMenu(false)}
              aria-label="Close profile menu">
              <X size={18} />
            </button>
          </div>

          <Link
            to="/profile"
            onClick={() => setShowProfileMenu(false)}
            className="flex mt-1 mx-1 py-2 items-center gap-3 text-[#2d3748] hover:text-[#111827] hover:bg-[#3b82f6]/10 px-3 rounded-xl transition-all duration-200">
            <User size={18} />
            <span>Profile Settings</span>
          </Link>
          <hr className="border-[#2d3748]/10 my-1" />
          <button
            onClick={() => {
              setShowProfileMenu(false);
              handleLogout();
            }}
            className="flex mx-1 py-2 items-center gap-3 text-red-600 hover:text-red-700 hover:bg-red-500/10 px-3 mb-4 rounded-xl transition-all duration-200 w-full text-left">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </motion.div>
      )}

      {/* Notification Dropdown */}
      <NotificationDropdown
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        triggerRef={bellRef}
      />
    </div>
  );
}
