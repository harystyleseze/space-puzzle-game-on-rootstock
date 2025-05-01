"use client";

import React from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import Image from "next/image";
import { Trophy } from "lucide-react";

export default function AchievementsPage() {
  const { isConnected, disconnectWallet, badges, playerStats, loading } =
    useWeb3();

  // Badge types for reference
  const badgeTypes = [
    {
      id: 1,
      name: "Bronze Explorer",
      description: "Earn 50 points",
      score: 50,
      image: "/images/bronze explorer.jpg",
    },
    {
      id: 2,
      name: "Silver Navigator",
      description: "Earn 200 points",
      score: 200,
      image: "/images/silver navigator.jpg",
    },
    {
      id: 3,
      name: "Gold Commander",
      description: "Earn 900 points",
      score: 900,
      image: "/images/gold commander.jpg",
    },
  ];

  // Function to get badge image based on badge type
  const getBadgeImage = (badgeType: string) => {
    const badge = badgeTypes.find(
      (b) => b.name.toLowerCase() === badgeType.toLowerCase()
    );
    return badge?.image || "/images/bronze explorer.jpg"; // Fallback to bronze badge image
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Space Puzzle Achievements</h1>

        <p className="mb-8">
          Earn unique NFT badges as you progress through the game. Connect your
          wallet to view and manage your achievements.
        </p>

        {/* Achievements Display */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Badges</h2>
          {!isConnected ? (
            <p className="text-gray-400">
              Connect your wallet to view your badges.
            </p>
          ) : loading.badges ? (
            <p>Loading badges...</p>
          ) : badges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {badges.map((badge, index) => (
                <div
                  key={index}
                  className="bg-gray-800 p-6 rounded-lg border border-blue-500"
                >
                  <div className="relative w-full h-48 mx-auto mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={getBadgeImage(badge.type)}
                      alt={badge.type}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-blue-600 p-1 rounded-full">
                      <Trophy className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-center mb-2">
                    {badge.type}
                  </h3>
                  <p className="text-center text-gray-400">
                    Score: {badge.score}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No badges earned yet. Keep playing to earn badges!</p>
          )}
        </div>

        {/* Available Badges */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Available Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {badgeTypes.map((badge) => {
              const earned = badges?.some(
                (b) => b.type.toLowerCase() === badge.name.toLowerCase()
              );
              return (
                <div
                  key={badge.id}
                  className={`bg-gray-800 p-6 rounded-lg ${
                    earned
                      ? "border border-green-500"
                      : "border border-gray-500"
                  }`}
                >
                  <div
                    className={`relative w-full h-48 mx-auto mb-4 rounded-lg overflow-hidden ${
                      !earned ? "ring-2 ring-gray-600" : ""
                    }`}
                  >
                    <Image
                      src={badge.image}
                      alt={badge.name}
                      fill
                      className="object-cover"
                    />
                    {earned ? (
                      <div className="absolute top-2 right-2 bg-green-600 p-1 rounded-full">
                        <Trophy className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <div className="absolute top-3 right-3 bg-gray-800 border-2 border-gray-600 p-2 rounded-full shadow-lg">
                        <span className="text-2xl">🔒</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-center mb-2">
                    {badge.name}
                  </h3>
                  <p className="text-center text-gray-400 mb-2">
                    {badge.description}
                  </p>
                  {isConnected && playerStats && (
                    <div className="mt-4">
                      <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{
                            width: `${Math.min(
                              (playerStats.points / badge.score) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-right mt-1 text-gray-400">
                        {playerStats.points}/{badge.score} points
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-12 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">
            About Blockchain Achievements
          </h2>
          <p className="mb-4">
            Space Puzzle uses blockchain technology to create permanent records
            of your achievements. Each badge is a unique NFT (Non-Fungible
            Token) that you truly own.
          </p>
          <p>
            These badges are stored on the blockchain and can be viewed in any
            compatible wallet. They serve as proof of your gaming
            accomplishments and may provide special benefits in future game
            updates.
          </p>
        </div>
      </div>
    </div>
  );
}
