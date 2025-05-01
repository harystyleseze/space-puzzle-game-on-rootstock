"use client";

import React from "react";
import { Clock, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DailyRewardsProps {
  canClaim: boolean;
  nextClaimTime: number;
  onClaim: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function DailyRewards({
  canClaim,
  nextClaimTime,
  onClaim,
  isLoading = false,
  error = null,
}: DailyRewardsProps) {
  // Format time until next claim
  const formatTimeRemaining = () => {
    if (!nextClaimTime) return "Loading...";

    const now = Math.floor(Date.now() / 1000);
    const timeLeft = Math.max(0, nextClaimTime - now);

    if (timeLeft <= 0) return "Available now";

    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // For debugging
  const debugInfo = () => {
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = nextClaimTime - now;

    alert(
      `Debug Info:
      Next Claim Time: ${new Date(nextClaimTime * 1000).toLocaleString()}
      Current Time: ${new Date().toLocaleString()}
      Time Left (seconds): ${timeLeft}
      Can Claim: ${canClaim ? "Yes" : "No"}`
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 flex justify-between">
        <span>Daily Points</span>
        <button
          onClick={debugInfo}
          className="text-xs text-gray-400 hover:text-gray-300"
        >
          Debug
        </button>
      </h2>
      <div className="bg-gray-700 p-4 rounded-lg mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400">Daily Point</span>
          <span className="text-yellow-400 font-bold">+1 point</span>
        </div>
        <div className="h-2 w-full bg-gray-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-500"
            style={{ width: canClaim ? "100%" : "0%" }}
          ></div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-200 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {canClaim ? (
        <button
          onClick={onClaim}
          disabled={isLoading}
          className={`w-full font-bold py-2 px-4 rounded transition-colors flex items-center justify-center ${
            isLoading
              ? "bg-yellow-700 cursor-not-allowed"
              : "bg-yellow-600 hover:bg-yellow-700"
          } text-white`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Claiming...
            </>
          ) : (
            "Claim Daily Point"
          )}
        </button>
      ) : (
        <div>
          <button
            disabled
            className="w-full bg-gray-700 text-gray-500 font-bold py-2 px-4 rounded cursor-not-allowed mb-2"
          >
            Claim Daily Point
          </button>
          <p className="text-center text-sm text-gray-400">
            Next claim in: {formatTimeRemaining()}
          </p>
        </div>
      )}
    </div>
  );
}
