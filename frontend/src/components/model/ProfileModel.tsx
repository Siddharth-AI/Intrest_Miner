"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion"; // Import AnimatePresence
import { User, LogOut, X, Settings, History } from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; // Assuming react-router-dom for navigation
import { FaMoneyBillWave } from "react-icons/fa";
import { clearCache } from "../../../store/features/facebookAdsSlice";
import { performLogout } from "@/utils/logout";
import { useAppDispatch } from "../../../store/hooks";
interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>; // Added triggerRef prop
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  triggerRef,
}) => {
  const [mounted, setMounted] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null); // Renamed modalRef to dropdownRef for clarity
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  // Handle mounting for SSR compatibility
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as HTMLElement;

      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      // Add a small delay to ensure the click that opened the dropdown doesn't immediately close it
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 100);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  // Position dropdown correctly (similar to NotificationDropdown)
  useEffect(() => {
    if (isOpen && dropdownRef.current && triggerRef?.current) {
      const updatePosition = (): void => {
        if (!triggerRef.current || !dropdownRef.current) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();

        // Position below and to the right of the trigger button
        let top = triggerRect.bottom + 10; // 10px below the button
        const right = window.innerWidth - triggerRect.right; // Align right edge with trigger's right edge

        // Adjust if would go off screen (simple check for bottom overflow)
        const dropdownHeight = dropdownRef.current.offsetHeight;
        if (top + dropdownHeight > window.innerHeight - 10) {
          // 10px from bottom of viewport
          // If it overflows, try to position it above the trigger
          top = triggerRect.top - dropdownHeight - 10; // 10px above the button
          if (top < 10) {
            // If it still overflows at the top, just place it at 10px from top
            top = 10;
          }
        }

        // Apply position
        dropdownRef.current.style.top = `${top}px`;
        dropdownRef.current.style.right = `${right}px`;
      };

      // Set initial position and update on resize
      updatePosition();
      window.addEventListener("resize", updatePosition);

      return () => window.removeEventListener("resize", updatePosition);
    }
  }, [isOpen, triggerRef]); // Depend on isOpen and triggerRef for re-calculation

  const handleLogout = async (): Promise<void> => {
    await performLogout(dispatch, navigate, {
      closeModal: onClose,
    });
  };

  if (!isOpen || !mounted) {
    return null; // Don't render if not open or not mounted on client
  }

  // Render the dropdown using a portal directly into the document.body
  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          // This is the full-screen overlay that blurs the background
          className="fixed inset-0 z-[9998]" // Backdrop for the dropdown
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}>
          <motion.div
            ref={dropdownRef}
            // This is the actual dropdown content, positioned absolutely relative to the viewport
            className="fixed w-64 right-5 top-16 max-h-[90vh] overflow-hidden bg-white border border-gray-200 shadow-2xl rounded-2xl z-[9999] py-4 px-4"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside the dropdown from closing it
          >
            {/* Close button inside the dropdown (optional, but good for consistency) */}

            <div className="space-y-2">
              {" "}
              {/* Adjusted spacing */}
              <Link
                to="/profile"
                onClick={onClose} // Close dropdown when navigating
                className="flex items-center gap-3 text-gray-800 hover:text-gray-900 hover:bg-gray-100 p-2.5 rounded-xl transition-all duration-200" // Adjusted padding
              >
                <User className="h-5 w-5 text-blue-500" />{" "}
                {/* Adjusted icon size */}
                <span>Profile</span>
              </Link>
              <hr className="border-gray-200 my-1" /> {/* Adjusted margin */}
              <Link
                to="/profile-update"
                onClick={onClose} // Close dropdown when navigating
                className="flex items-center gap-3 text-gray-800 hover:text-gray-900 hover:bg-gray-100 p-2.5 rounded-xl transition-all duration-200" // Adjusted padding
              >
                {/* <User size={16} />{" "} */}
                <Settings className="h-5 w-5 text-blue-500" />
                {/* Adjusted icon size */}
                <span>Account Settings</span>
              </Link>
              <hr className="border-gray-200 my-1" /> {/* Adjusted margin */}
              <Link
                to="/search-history"
                onClick={onClose} // Close dropdown when navigating
                className="flex items-center gap-3 text-gray-800 hover:text-gray-900 hover:bg-gray-100 p-2.5 rounded-xl transition-all duration-200" // Adjusted padding
              >
                {/* <User size={16} />{" "} */}
                <History className="h-5 w-5 text-blue-500" />
                {/* Adjusted icon size */}
                <span>Search History</span>
              </Link>
              <hr className="border-gray-200 my-1" />
              <Link
                to="/billing-history"
                onClick={onClose} // Close dropdown when navigating
                className="flex items-center gap-3 text-gray-800 hover:text-gray-900 hover:bg-gray-100 p-2.5 rounded-xl transition-all duration-200" // Adjusted padding
              >
                {/* <User size={16} />{" "} */}
                <FaMoneyBillWave className="h-5 w-5 text-blue-500" />
                {/* Adjusted icon size */}
                <span>Billing History</span>
              </Link>
              <hr className="border-gray-200 my-1" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 p-2.5 rounded-xl transition-all duration-200 w-full text-left" // Adjusted padding
              >
                <LogOut size={16} className="text-red-500" />{" "}
                {/* Adjusted icon size */}
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body // Render directly into the document body
  );
};

export default ProfileModal;
