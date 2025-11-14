import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Option {
  id: string;
  name: string;
}

interface CustomDropdownProps {
  label: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder: string;
  isDarkMode: boolean;
  colorScheme: "blue" | "purple";
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder,
  isDarkMode,
  colorScheme,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  const colors = {
    blue: {
      dot: "bg-blue-500",
      border: isDarkMode
        ? "border-slate-600/50 hover:border-blue-500/50"
        : "border-gray-300/50 hover:border-blue-400/50",
      hover: isDarkMode ? "hover:bg-slate-700/70" : "hover:bg-blue-50",
    },
    purple: {
      dot: "bg-purple-500",
      border: isDarkMode
        ? "border-slate-600/50 hover:border-purple-500/50"
        : "border-gray-300/50 hover:border-purple-400/50",
      hover: isDarkMode ? "hover:bg-slate-700/70" : "hover:bg-purple-50",
    },
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-3" ref={dropdownRef}>
      {label !== "no" && (
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              value ? "bg-green-500 animate-pulse" : "bg-gray-400"
            }`}
          />
          <label
            className={`text-sm font-semibold tracking-wide ${
              isDarkMode ? "text-gray-200" : "text-gray-700"
            }`}>
            {label}
          </label>
        </div>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={`w-full h-14 rounded-xl shadow-md backdrop-blur-xl border-2 transition-all duration-300 font-medium px-4 flex items-center justify-between ${
            isDarkMode
              ? `bg-slate-800/80 text-gray-100 ${colors[colorScheme].border} hover:bg-slate-700/80`
              : `bg-white/90 text-gray-800 ${colors[colorScheme].border} hover:bg-white`
          } ${isOpen ? "ring-2 ring-offset-2 ring-offset-transparent" : ""}`}>
          <div className="flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full ${
                value ? colors[colorScheme].dot : "bg-gray-400"
              }`}
            />
            <span className={selectedOption ? "" : "text-gray-500"}>
              {selectedOption ? selectedOption.name : placeholder}
            </span>
          </div>

          <svg
            className={`w-5 h-5 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`absolute z-50 w-full mt-2 rounded-xl backdrop-blur-xl shadow-2xl border overflow-hidden ${
                isDarkMode
                  ? "bg-slate-800/95 text-gray-100 border-slate-700"
                  : "bg-white/95 text-gray-900 border-gray-200"
              }`}>
              <div ref={menuRef} className="max-h-64 overflow-y-auto">
                {options.length === 0 ? (
                  <div className="py-8 px-4 text-center text-gray-500">
                    No options available
                  </div>
                ) : (
                  options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelect(option.id)}
                      className={`w-full py-3.5 px-4 cursor-pointer transition-colors duration-200 flex items-center gap-3 text-left ${
                        colors[colorScheme].hover
                      } ${
                        option.id === value
                          ? isDarkMode
                            ? "bg-slate-700/50"
                            : "bg-gray-100"
                          : ""
                      }`}>
                      <div
                        className={`w-2 h-2 rounded-full ${colors[colorScheme].dot}`}
                      />
                      <span className="font-medium flex-1">{option.name}</span>

                      {option.id === value && (
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  ))
                )}
              </div>

              <div
                className={`py-2 px-4 text-xs font-medium border-t ${
                  isDarkMode
                    ? "text-gray-400 border-slate-700"
                    : "text-gray-500 border-gray-200"
                }`}>
                {options.length} option{options.length !== 1 ? "s" : ""}{" "}
                available
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
