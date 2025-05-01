"use client";

import GameWrapper from "@/components/GameWrapper";
import { useTheme } from "@/contexts/ThemeContext";

export default function GamePage() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Game content */}
      <div className="flex-1 flex items-center justify-center">
        <GameWrapper />
      </div>
    </div>
  );
}
