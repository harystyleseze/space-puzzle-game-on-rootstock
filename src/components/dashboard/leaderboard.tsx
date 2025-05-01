"use client";

import React from "react";
import { Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface LeaderboardProps {
  isLoading?: boolean;
  scores: Array<{
    player: string;
    score: number;
  }>;
  playerAddress: string;
}

export default function Leaderboard({
  isLoading,
  scores,
  playerAddress,
}: LeaderboardProps) {
  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Top Scores</h2>
        <div className="animate-pulse">
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Top Scores</h2>
      {scores.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-700">
              <tr>
                <th className="py-2 px-2 sm:px-4 text-left text-xs sm:text-sm">
                  Rank
                </th>
                <th className="py-2 px-2 sm:px-4 text-left text-xs sm:text-sm">
                  Player
                </th>
                <th className="py-2 px-2 sm:px-4 text-right text-xs sm:text-sm">
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score, index) => (
                <tr
                  key={index}
                  className={`border-t border-gray-700 ${
                    playerAddress && score.player === playerAddress
                      ? "bg-blue-900/30 text-yellow-400"
                      : ""
                  }`}
                >
                  <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm">
                    {index + 1}
                  </td>
                  <td className="py-2 px-2 sm:px-4 font-mono text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[150px]">
                    {score.player.slice(0, 6)}...{score.player.slice(-4)}
                  </td>
                  <td className="py-2 px-2 sm:px-4 text-right text-xs sm:text-sm">
                    {score.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400">No scores available yet.</p>
      )}
    </div>
  );
}
