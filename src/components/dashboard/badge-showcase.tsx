"use client";

import React from "react";
import Image from "next/image";
import { Award, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface BadgeShowcaseProps {
  isLoading?: boolean;
  badges: any[];
  playerPoints: number;
}

export default function BadgeShowcase({
  isLoading,
  badges,
  playerPoints,
}: BadgeShowcaseProps) {
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

  const getBadgeColor = (type: number, earned: boolean) => {
    if (!earned) return "bg-slate-700 text-slate-400";

    switch (type) {
      case 1:
        return "bg-[#CD7F32] text-white"; // Bronze
      case 2:
        return "bg-[#C0C0C0] text-white"; // Silver
      case 3:
        return "bg-[#FFD700] text-black"; // Gold
      default:
        return "bg-slate-700 text-slate-400";
    }
  };

  const getBadgeImage = (type: number | string) => {
    // If type is a full badge name (e.g., "Bronze Explorer"), find it directly
    if (typeof type === "string" && isNaN(parseInt(type))) {
      const badge = badgeTypes.find((b) => b.name === type);
      return badge?.image || "/images/bronze explorer.jpg";
    }

    // Otherwise, convert type to a number and find the corresponding badge
    const typeNum = typeof type === "string" ? parseInt(type) : type;

    // Convert type number to badge name
    let badgeName = "";
    switch (typeNum) {
      case 1:
        badgeName = "Bronze Explorer";
        break;
      case 2:
        badgeName = "Silver Navigator";
        break;
      case 3:
        badgeName = "Gold Commander";
        break;
      default:
        return "/images/bronze explorer.jpg"; // Fallback to bronze badge
    }

    // Find the badge by name
    const badge = badgeTypes.find((b) => b.name === badgeName);
    return badge?.image || "/images/bronze explorer.jpg";
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Your Badges</h2>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="h-48 bg-gray-700 rounded"></div>
            <div className="h-48 bg-gray-700 rounded"></div>
            <div className="h-48 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Your Badges</h2>
      {badges.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="bg-gray-700 p-4 rounded-lg border border-blue-500 flex flex-col items-center"
            >
              <div className="relative w-full h-32 mb-3 overflow-hidden rounded-lg">
                <Image
                  src={getBadgeImage(badge.type)}
                  alt={`Badge ${badge.type}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-1">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-center font-bold">
                {typeof badge.type === "string" && isNaN(parseInt(badge.type))
                  ? badge.type
                  : badge.type === "1" || badge.type === 1
                  ? "Bronze Explorer"
                  : badge.type === "2" || badge.type === 2
                  ? "Silver Navigator"
                  : badge.type === "3" || badge.type === 3
                  ? "Gold Commander"
                  : `Badge ${badge.type}`}
              </h3>
              <p className="text-center text-gray-400 text-sm mt-1">
                Score: {badge.score}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-400">No badges earned yet.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {badgeTypes.map((badge) => {
              const progress = Math.min(
                (playerPoints / badge.score) * 100,
                100
              );
              const isEarned = playerPoints >= badge.score;

              return (
                <div key={badge.id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="relative w-full h-32 mb-3 overflow-hidden rounded-lg">
                    <div
                      className={`absolute inset-0 ${
                        isEarned ? "" : "opacity-40 grayscale"
                      }`}
                    >
                      <Image
                        src={badge.image}
                        alt={badge.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {isEarned && (
                      <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-1">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-center font-bold mb-2">{badge.name}</h3>
                  <p className="text-center text-gray-400 text-sm mb-2">
                    {badge.description}
                  </p>

                  <div className="h-2 w-full bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        isEarned ? "bg-green-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-right mt-1 text-gray-400">
                    {playerPoints}/{badge.score} points
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
