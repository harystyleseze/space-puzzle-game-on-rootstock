"use client";

import React, { ReactNode } from "react";
import Header from "./Header";
import { Web3Provider } from "@/contexts/Web3Context";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Toaster } from "@/components/ui/toaster";
import NetworkWarning from "@/components/NetworkWarning";

interface LayoutProps {
  children: ReactNode;
}

function LayoutContent({ children }: LayoutProps) {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <NetworkWarning />
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
      <footer className="bg-gray-900 text-gray-400 py-6 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 Space Puzzle Game. All rights reserved.</p>
          <div className="mt-2 flex justify-center space-x-4">
            <a href="#" className="text-[#F89213] hover:text-[#e07e0e]">
              Terms
            </a>
            <a href="#" className="text-[#F89213] hover:text-[#e07e0e]">
              Privacy
            </a>
            <a href="#" className="text-[#F89213] hover:text-[#e07e0e]">
              Contact
            </a>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}

export default function Layout({ children }: LayoutProps) {
  return (
    <Web3Provider>
      <ThemeProvider>
        <LayoutContent>{children}</LayoutContent>
      </ThemeProvider>
    </Web3Provider>
  );
}
