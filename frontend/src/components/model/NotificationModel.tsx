"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Audio, DNA } from "react-loader-spinner";
import {
  Bell,
  Check,
  ChevronRight,
  Gift,
  Info,
  MessageSquare,
  Settings,
  ShieldAlert,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: number;
  type: "success" | "info" | "alert" | "promo" | "message" | "update";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  icon: string;
  date: string;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

type ActiveTab = "all" | "unread" | "alert";

type GroupedNotifications = {
  [key: string]: Notification[];
};

const NotificationModel: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  triggerRef,
}) => {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [mounted, setMounted] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Handle mounting for SSR compatibility
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Click outside detection
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
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, onClose, triggerRef]);

  // Position dropdown correctly (desktop only)
  useEffect(() => {
    if (isOpen && dropdownRef.current && triggerRef?.current && !isMobile) {
      const updatePosition = (): void => {
        if (!triggerRef.current || !dropdownRef.current) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();

        let top = triggerRect.bottom + 10;
        const right = 20;

        const dropdownHeight = dropdownRef.current.offsetHeight;
        if (top + dropdownHeight > window.innerHeight) {
          top = Math.max(10, window.innerHeight - dropdownHeight - 10);
        }

        dropdownRef.current.style.top = `${top}px`;
        dropdownRef.current.style.right = `${right}px`;
      };

      updatePosition();
      window.addEventListener("resize", updatePosition);

      return () => window.removeEventListener("resize", updatePosition);
    }
  }, [isOpen, triggerRef, notifications, isMobile]);

  // Fetch notifications
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setTimeout(() => {
        const mockNotifications: Notification[] = [
          {
            id: 1,
            type: "success",
            title: "Export Completed",
            message:
              "Your data export for 'Digital Marketing' has completed successfully.",
            time: "Just now",
            isRead: false,
            icon: "download",
            date: "Today",
          },
          {
            id: 2,
            type: "info",
            title: "Weekly Report",
            message: "Your weekly analytics report is now available.",
            time: "2 hours ago",
            isRead: false,
            icon: "chart",
            date: "Today",
          },
          {
            id: 3,
            type: "alert",
            title: "Login Attempt",
            message: "New login detected from San Francisco, CA.",
            time: "Yesterday",
            isRead: true,
            icon: "alert",
            date: "Yesterday",
          },
          {
            id: 4,
            type: "promo",
            title: "Premium Discount",
            message: "Get 20% off when you upgrade to our annual plan!",
            time: "Yesterday",
            isRead: true,
            icon: "gift",
            date: "Yesterday",
          },
          {
            id: 5,
            type: "message",
            title: "New Message",
            message:
              "Support team: 'We've received your inquiry and will respond shortly.'",
            time: "3 days ago",
            isRead: true,
            icon: "message",
            date: "Older",
          },
          {
            id: 6,
            type: "update",
            title: "System Update",
            message: "InterestMiner has been updated to version 2.4.0",
            time: "5 days ago",
            isRead: true,
            icon: "update",
            date: "Older",
          },
        ];
        setNotifications(mockNotifications);
        setLoading(false);
      }, 600);
    }
  }, [isOpen]);

  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : activeTab === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications.filter((n) => n.type === activeTab);

  // Group notifications by date
  const groupedNotifications: GroupedNotifications =
    filteredNotifications.reduce(
      (groups: GroupedNotifications, notification) => {
        const date = notification.date;
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(notification);
        return groups;
      },
      {}
    );

  const getNotificationIcon = (
    type: string,
    iconName: string
  ): React.JSX.Element => {
    const iconClasses = "h-5 w-5";

    if (iconName === "download") return <Check className={iconClasses} />;
    if (iconName === "chart") return <Info className={iconClasses} />;
    if (iconName === "alert") return <ShieldAlert className={iconClasses} />;
    if (iconName === "gift") return <Gift className={iconClasses} />;
    if (iconName === "message")
      return <MessageSquare className={iconClasses} />;
    if (iconName === "update") return <Star className={iconClasses} />;

    // Default icon based on type
    switch (type) {
      case "success":
        return <Check className={iconClasses} />;
      case "info":
        return <Info className={iconClasses} />;
      case "alert":
        return <ShieldAlert className={iconClasses} />;
      case "promo":
        return <Gift className={iconClasses} />;
      case "message":
        return <MessageSquare className={iconClasses} />;
      default:
        return <Bell className={iconClasses} />;
    }
  };

  const getNotificationColor = (type: string): string => {
    switch (type) {
      case "success":
        return "bg-green-500/20 text-green-700 border-green-500/30";
      case "info":
        return "bg-[#3b82f6]/20 text-[#3b82f6] border-[#3b82f6]/30";
      case "alert":
        return "bg-amber-500/20 text-amber-700 border-amber-500/30";
      case "promo":
        return "bg-[#2563eb]/20 text-[#2563eb] border-[#2563eb]/30";
      case "message":
        return "bg-indigo-500/20 text-indigo-700 border-indigo-500/30";
      case "update":
        return "bg-cyan-500/20 text-cyan-700 border-cyan-500/30";
      default:
        return "bg-gray-500/20 text-gray-700 border-gray-500/30";
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (!isOpen || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed inset-0 z-[9998] ${isMobile ? "bg-black/50" : ""}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}>
          <motion.div
            ref={dropdownRef}
            className={`
              ${
                isMobile
                  ? "fixed inset-0 w-full h-full bg-[#f1f5f9] overflow-y-auto"
                  : "fixed w-96 max-h-[90vh] overflow-hidden bg-[#f1f5f9] border border-[#2d3748]/20 shadow-2xl rounded-2xl scrollbar-hide"
              }
              z-[9999]
            `}
            style={!isMobile ? { top: "70px", right: "20px" } : {}}
            initial={
              isMobile
                ? { opacity: 0, y: "100%" }
                : { opacity: 0, y: -20, scale: 0.95 }
            }
            animate={
              isMobile ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, scale: 1 }
            }
            exit={
              isMobile
                ? { opacity: 0, y: "100%" }
                : { opacity: 0, y: -20, scale: 0.95 }
            }
            transition={{ duration: 0.3, ease: "easeOut" }}>
            {/* Header */}
            <div
              className={`${
                isMobile ? "p-6 pt-12" : "p-4"
              } border-b border-[#2d3748]/10 flex items-center justify-between`}>
              <div>
                <h3
                  className={`${
                    isMobile ? "text-xl" : "text-lg"
                  } font-semibold text-[#111827] flex items-center gap-2`}>
                  <Bell className={`${isMobile ? "h-6 w-6" : "h-5 w-5"}`} />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {!isMobile && (
                  <button
                    onClick={() =>
                      setNotifications(
                        notifications.map((notif) => ({
                          ...notif,
                          isRead: true,
                        }))
                      )
                    }
                    className="text-xs bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 transition-colors px-2 py-1 rounded-md text-[#2d3748] hover:text-[#111827]"
                    disabled={unreadCount === 0}>
                    Mark all as read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className={`${
                    isMobile ? "p-2" : "p-1"
                  } hover:bg-[#3b82f6]/10 rounded-full transition-colors`}>
                  <X
                    className={`${
                      isMobile ? "h-6 w-6" : "h-5 w-5"
                    } text-[#2d3748] hover:text-[#111827]`}
                  />
                </button>
              </div>
            </div>

            {/* Mobile Mark All as Read Button */}
            {isMobile && (
              <div className="px-6 py-3 border-b border-[#2d3748]/10">
                <button
                  onClick={() =>
                    setNotifications(
                      notifications.map((notif) => ({ ...notif, isRead: true }))
                    )
                  }
                  className="w-full bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 transition-colors px-4 py-2 rounded-lg text-sm text-[#2d3748] hover:text-[#111827]"
                  disabled={unreadCount === 0}>
                  Mark all as read
                </button>
              </div>
            )}

            {/* Tabs */}
            <div
              className={`flex border-b border-[#2d3748]/10 ${
                isMobile ? "px-6" : "px-2"
              }`}>
              <button
                onClick={() => setActiveTab("all")}
                className={`${
                  isMobile ? "px-6 py-3" : "px-4 py-2"
                } text-sm font-medium transition-colors relative ${
                  activeTab === "all"
                    ? "text-[#111827]"
                    : "text-[#2d3748] hover:text-[#111827]"
                }`}>
                All
                {activeTab === "all" && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#3b82f6] to-[#2563eb]"
                    layoutId="activeTab"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab("unread")}
                className={`${
                  isMobile ? "px-6 py-3" : "px-4 py-2"
                } text-sm font-medium transition-colors relative ${
                  activeTab === "unread"
                    ? "text-[#111827]"
                    : "text-[#2d3748] hover:text-[#111827]"
                }`}>
                Unread
                {unreadCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
                {activeTab === "unread" && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#3b82f6] to-[#2563eb]"
                    layoutId="activeTab"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab("alert")}
                className={`${
                  isMobile ? "px-6 py-3" : "px-4 py-2"
                } text-sm font-medium transition-colors relative ${
                  activeTab === "alert"
                    ? "text-[#111827]"
                    : "text-[#2d3748] hover:text-[#111827]"
                }`}>
                Alerts
                {activeTab === "alert" && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#3b82f6] to-[#2563eb]"
                    layoutId="activeTab"
                  />
                )}
              </button>
            </div>

            {/* Notification List */}
            <div
              className={`overflow-y-auto ${
                isMobile ? "flex-1 pb-20" : "max-h-[calc(80vh-120px)]"
              }`}>
              {loading ? (
                <div
                  className={`flex flex-col items-center justify-center ${
                    isMobile ? "py-20" : "py-12"
                  }`}>
                  <DNA
                    visible={true}
                    height="80"
                    width="80"
                    ariaLabel="dna-loading"
                    wrapperStyle={{}}
                    wrapperClass="dna-wrapper"
                  />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div
                  className={`flex flex-col items-center justify-center ${
                    isMobile ? "py-20 px-6" : "py-12 px-4"
                  }`}>
                  <div className="bg-[#3b82f6]/5 rounded-full p-4 mb-4">
                    <Bell className="h-8 w-8 text-[#2d3748]" />
                  </div>
                  <p className="text-[#111827] text-center">
                    No notifications to display
                  </p>
                  <p className="text-[#2d3748] text-sm text-center mt-1">
                    {activeTab !== "all"
                      ? `Try switching to a different tab`
                      : `You're all caught up!`}
                  </p>
                </div>
              ) : (
                <div>
                  {Object.keys(groupedNotifications).map((date) => (
                    <div key={date}>
                      <div
                        className={`${
                          isMobile ? "px-6 py-3" : "px-4 py-2"
                        } bg-[#3b82f6]/5`}>
                        <p className="text-xs font-medium text-[#2d3748]">
                          {date}
                        </p>
                      </div>
                      {groupedNotifications[date].map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          className={`border-b border-[#2d3748]/5 transition-colors ${
                            notification.isRead
                              ? "bg-transparent"
                              : "bg-[#3b82f6]/5"
                          } hover:bg-[#3b82f6]/10`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}>
                          <div
                            className={`${
                              isMobile ? "px-6 py-4" : "px-4 py-3"
                            } flex gap-3`}>
                            {/* Icon */}
                            <div
                              className={`flex-shrink-0 ${
                                isMobile ? "h-12 w-12" : "h-10 w-10"
                              } rounded-full flex items-center justify-center ${getNotificationColor(
                                notification.type
                              )}`}>
                              {getNotificationIcon(
                                notification.type,
                                notification.icon
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <p
                                  className={`${
                                    isMobile ? "text-base" : "text-sm"
                                  } font-medium ${
                                    notification.isRead
                                      ? "text-[#2d3748]"
                                      : "text-[#111827]"
                                  }`}>
                                  {notification.title}
                                </p>
                                <span
                                  className={`${
                                    isMobile ? "text-sm" : "text-xs"
                                  } text-[#2d3748] whitespace-nowrap ml-2`}>
                                  {notification.time}
                                </span>
                              </div>
                              <p
                                className={`${
                                  isMobile ? "text-sm" : "text-sm"
                                } text-[#2d3748] mt-1 line-clamp-2`}>
                                {notification.message}
                              </p>

                              {/* Actions */}
                              <div
                                className={`flex items-center justify-between ${
                                  isMobile ? "mt-3" : "mt-2"
                                }`}>
                                <div className="flex gap-2">
                                  {!notification.isRead && (
                                    <button
                                      onClick={() =>
                                        setNotifications(
                                          notifications.map((notif) =>
                                            notif.id === notification.id
                                              ? { ...notif, isRead: true }
                                              : notif
                                          )
                                        )
                                      }
                                      className={`${
                                        isMobile
                                          ? "text-sm px-3 py-1"
                                          : "text-xs px-2 py-0.5"
                                      } bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 transition-colors rounded text-[#3b82f6] hover:text-[#2563eb]`}>
                                      Mark as read
                                    </button>
                                  )}
                                  <button
                                    className={`${
                                      isMobile
                                        ? "text-sm px-3 py-1"
                                        : "text-xs px-2 py-0.5"
                                    } bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 transition-colors rounded text-[#2d3748] hover:text-[#111827]`}>
                                    View
                                  </button>
                                </div>
                                <button
                                  onClick={() =>
                                    setNotifications(
                                      notifications.filter(
                                        (notif) => notif.id !== notification.id
                                      )
                                    )
                                  }
                                  className={`text-[#2d3748] hover:text-red-600 transition-colors ${
                                    isMobile ? "p-2" : "p-1"
                                  } hover:bg-red-500/10 rounded`}>
                                  <Trash2
                                    className={`${
                                      isMobile ? "h-4 w-4" : "h-3.5 w-3.5"
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className={`${
                isMobile ? "p-6" : "p-3"
              } border-t border-[#2d3748]/10 bg-[#3b82f6]/5`}>
              <div
                className={`flex ${
                  isMobile ? "flex-col gap-3" : "justify-between items-center"
                }`}>
                <button
                  className={`${
                    isMobile ? "text-base" : "text-sm"
                  } text-[#2d3748] hover:text-[#111827] transition-colors flex items-center gap-2`}>
                  <Settings className={`${isMobile ? "h-5 w-5" : "h-4 w-4"}`} />
                  <span>Notification Settings</span>
                </button>
                <button
                  className={`${
                    isMobile ? "text-base" : "text-sm"
                  } text-[#3b82f6] hover:text-[#2563eb] transition-colors flex items-center gap-2`}>
                  View All
                  <ChevronRight
                    className={`${isMobile ? "h-5 w-5" : "h-4 w-4"}`}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default NotificationModel;
