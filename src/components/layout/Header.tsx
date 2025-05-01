"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWeb3 } from "@/contexts/Web3Context";
import { useTheme } from "@/contexts/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";
import FaucetButton from "@/components/FaucetButton";

export default function Header() {
  const { account, isConnected, connectWallet, disconnectWallet, playerStats } =
    useWeb3();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Game", path: "/game" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Achievements", path: "/achievements" },
  ];

  return (
    <header className="bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-[#F89213]">
              Space Puzzle
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`hover:text-[#F89213] transition-colors ${
                  pathname === link.path ? "text-[#F89213] font-semibold" : ""
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Wallet Connection */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-800 text-[#F89213]"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <FaSun size={16} /> : <FaMoon size={16} />}
            </button>

            {isConnected ? (
              <div className="flex items-center space-x-3">
                {playerStats && (
                  <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1 rounded-lg">
                    <span className="text-[#F89213]">
                      {playerStats.points} Points
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="text-green-400">
                      {playerStats.keys} Keys
                    </span>
                  </div>
                )}
                <div className="bg-gray-800 border border-blue-500 px-3 py-1 rounded-lg">
                  <span className="font-mono text-blue-400">
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </span>
                </div>
                <FaucetButton />
                <button
                  onClick={disconnectWallet}
                  className="bg-[#F89213] hover:bg-[#e07e0e] text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-[#F89213] hover:bg-[#e07e0e] text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Theme Toggle for Mobile */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-800 text-[#F89213]"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <FaSun size={16} /> : <FaMoon size={16} />}
            </button>

            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`hover:text-[#F89213] transition-colors ${
                    pathname === link.path ? "text-[#F89213] font-semibold" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {!isConnected ? (
                <button
                  onClick={() => {
                    connectWallet();
                    setIsMenuOpen(false);
                  }}
                  className="bg-[#F89213] hover:bg-[#e07e0e] text-white font-bold py-2 px-4 rounded transition-colors text-left"
                >
                  Connect Wallet
                </button>
              ) : (
                <>
                  <div className="flex flex-col space-y-2">
                    {playerStats && (
                      <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1 rounded-lg w-fit">
                        <span className="text-[#F89213]">
                          {playerStats.points} Points
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="text-green-400">
                          {playerStats.keys} Keys
                        </span>
                      </div>
                    )}
                    <div className="bg-gray-800 border border-blue-500 px-3 py-1 rounded-lg w-fit">
                      <span className="font-mono text-blue-400">
                        {account?.slice(0, 6)}...{account?.slice(-4)}
                      </span>
                    </div>
                    <div className="w-fit">
                      <FaucetButton />
                    </div>
                    <button
                      onClick={() => {
                        disconnectWallet();
                        setIsMenuOpen(false);
                      }}
                      className="bg-[#F89213] hover:bg-[#e07e0e] text-white font-bold py-2 px-4 rounded transition-colors text-left w-fit"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
