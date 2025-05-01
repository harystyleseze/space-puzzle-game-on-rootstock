"use client";

import React from "react";
import { User, Award, Trophy } from "lucide-react";

export interface PlayerStatsProps {
  isLoading?: boolean;
  stats: {
    address: string;
    points: number;
    keys: number;
    highScore: number;
    currentLevel: number;
    highestLevel: number;
  };
}

export default function PlayerStats({ isLoading, stats }: PlayerStatsProps) {
  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Player Stats</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="h-12 bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Player Stats</h2>
      <div className="mb-4">
        <p className="text-gray-400 break-words">
          Wallet:{" "}
          <span className="font-mono bg-gray-700 border border-blue-500 px-2 py-1 rounded text-blue-400">
            {stats.address.slice(0, 6)}...{stats.address.slice(-4)}
          </span>
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Points</p>
          <p className="text-xl font-bold text-yellow-400">{stats.points}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Keys</p>
          <p className="text-xl font-bold text-green-400">{stats.keys}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">High Score</p>
          <p className="text-xl font-bold">{stats.highScore}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Current Level</p>
          <p className="text-xl font-bold">{stats.currentLevel}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Highest Level</p>
          <p className="text-xl font-bold">{stats.highestLevel}</p>
        </div>
      </div>
    </div>
  );
}
