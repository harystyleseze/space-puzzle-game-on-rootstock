"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWeb3 } from "@/contexts/Web3Context";
import PlayerStats from "@/components/dashboard/player-stats";
import Leaderboard from "@/components/dashboard/leaderboard";
import DailyRewards from "@/components/dashboard/daily-rewards";
import BadgeShowcase from "@/components/dashboard/badge-showcase";
import KeyConversion from "@/components/dashboard/key-conversion";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const {
    account,
    isConnected,
    connectWallet,
    disconnectWallet,
    playerStats,
    badges,
    topScores,
    loading,
    claimDailyPoints,
  } = useWeb3();

  const [error, setError] = useState<string | null>(null);
  const [isClaimLoading, setIsClaimLoading] = useState(false);

  // Check if claim is available
  const nextClaimTime = playerStats?.nextClaimTime || 0;
  const canClaim = playerStats && Date.now() / 1000 > nextClaimTime + 10; // Add 10-second buffer

  // For debugging
  useEffect(() => {
    if (playerStats) {
      console.log(
        "Next claim time:",
        new Date(nextClaimTime * 1000).toLocaleString()
      );
      console.log("Current time:", new Date().toLocaleString());
      console.log("Can claim:", canClaim);
      console.log(
        "Time difference (seconds):",
        Math.floor(Date.now() / 1000) - nextClaimTime
      );
    }
  }, [playerStats, nextClaimTime, canClaim]);

  // Handle claim daily points
  const handleClaim = async () => {
    if (canClaim) {
      try {
        setError(null);
        setIsClaimLoading(true);
        await claimDailyPoints();
        setIsClaimLoading(false);
      } catch (error: any) {
        console.error("Error claiming daily points:", error);
        setIsClaimLoading(false);
        // Display error to user
        setError(
          error.message || "Unknown error occurred while claiming daily points"
        );
      }
    } else if (playerStats) {
      // If user tries to claim when not eligible
      const timeLeft = nextClaimTime - Math.floor(Date.now() / 1000);
      setError(
        `You can't claim yet. Please wait ${Math.floor(
          timeLeft / 60
        )} minutes and ${timeLeft % 60} seconds.`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Player Dashboard</h1>
          {!isConnected && (
            <Button
              onClick={connectWallet}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Connect Wallet
            </Button>
          )}
        </div>

        {!isConnected ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="mb-6">
              Connect your wallet to view your game stats, badges, and claim
              daily rewards.
            </p>
            <button
              onClick={connectWallet}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Player Stats */}
              <PlayerStats
                isLoading={loading.stats}
                stats={{
                  address: account || "",
                  points: playerStats?.points || 0,
                  keys: playerStats?.keys || 0,
                  highScore: playerStats?.highScore || 0,
                  currentLevel: playerStats?.currentLevel || 0,
                  highestLevel: playerStats?.highestLevel || 0,
                }}
              />

              {/* Badge Showcase */}
              <BadgeShowcase
                isLoading={loading.badges}
                badges={badges || []}
                playerPoints={playerStats?.points || 0}
              />

              {/* Game Actions */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Game Actions</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/game"
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors text-center"
                  >
                    Play Game
                  </Link>
                  <Link
                    href="/achievements"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors text-center"
                  >
                    View Achievements
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Daily Rewards */}
              <DailyRewards
                canClaim={canClaim}
                nextClaimTime={nextClaimTime}
                onClaim={handleClaim}
                isLoading={isClaimLoading}
                error={error}
              />

              {/* Key Conversion */}
              <KeyConversion />

              {/* Leaderboard */}
              <Leaderboard
                isLoading={loading.scores}
                scores={topScores || []}
                playerAddress={account || ""}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
