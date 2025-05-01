"use client";

import { motion } from "framer-motion";
import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className={`p-2 rounded-full ${
        theme === "dark"
          ? "bg-gray-700 text-yellow-300"
          : "bg-blue-100 text-blue-800"
      }`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <FaSun size={20} /> : <FaMoon size={20} />}
    </motion.button>
  );
}
