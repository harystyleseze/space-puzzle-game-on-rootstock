"use client";

import React, { useState, useEffect } from "react";
import { useSpacePuzzleContract } from "@/hooks/useSpacePuzzleContract";
import Image from "next/image";
import { Trophy } from "lucide-react";

export default function Web3Connect() {
  const {
    account,
    isConnected,
    error,
    connectWallet,
    disconnectWallet,
    updateHighScore,
    getPlayerBadges,
    getPlayerStats,
    claimDailyPoints,
    getTopScores,
    addKeys,
    removeKeys,
    convertKeysToPoints,
  } = useSpacePuzzleContract();

  const [badges, setBadges] = useState<any[]>([]);
  const [playerStats, setPlayerStats] = useState<any>(null);
  const [topScores, setTopScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [scoresLoading, setScoresLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [convertLoading, setConvertLoading] = useState(false);
  const [addKeysLoading, setAddKeysLoading] = useState(false);
  const [keysToAdd, setKeysToAdd] = useState<number>(10);
  const [keysToConvert, setKeysToConvert] = useState<number>(50);
  const [actionError, setActionError] = useState<string | null>(null);

  // Load badges, stats, and top scores when account changes
  useEffect(() => {
    if (isConnected && account) {
      loadBadges();
      loadPlayerStats();
      loadTopScores();
    }
  }, [isConnected, account]);

  // Function to load player badges
  const loadBadges = async () => {
    try {
      setLoading(true);
      const playerBadges = await getPlayerBadges();
      setBadges(playerBadges || []);
    } catch (err: any) {
      console.error("Error loading badges:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to load player stats
  const loadPlayerStats = async () => {
    try {
      setStatsLoading(true);
      const stats = await getPlayerStats();
      setPlayerStats(stats);
    } catch (err: any) {
      console.error("Error loading player stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Function to load top scores
  const loadTopScores = async () => {
    try {
      setScoresLoading(true);
      const scores = await getTopScores();
      setTopScores(
        scores.filter(
          (score: any) =>
            score.player !== "0x0000000000000000000000000000000000000000"
        )
      );
    } catch (err: any) {
      console.error("Error loading top scores:", err);
    } finally {
      setScoresLoading(false);
    }
  };

  // Function to update score (which can trigger badge minting)
  const handleUpdateScore = async (score: number) => {
    try {
      setUpdateLoading(true);
      setActionError(null);
      await updateHighScore(score);
      await loadBadges(); // Reload badges after updating score
      await loadPlayerStats(); // Reload stats after updating score
      await loadTopScores(); // Reload top scores after updating score
    } catch (err: any) {
      console.error("Error updating score:", err);
      setActionError(err.message || "Failed to update score");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Function to claim daily points
  const handleClaimDailyPoints = async () => {
    try {
      setClaimLoading(true);
      setActionError(null);
      await claimDailyPoints();
      await loadPlayerStats(); // Reload stats after claiming
      await loadBadges(); // Reload badges after claiming points
    } catch (err: any) {
      console.error("Error claiming daily points:", err);
      setActionError(err.message || "Failed to claim daily points");
    } finally {
      setClaimLoading(false);
    }
  };

  // Function to add keys (for testing)
  const handleAddKeys = async () => {
    try {
      setAddKeysLoading(true);
      setActionError(null);
      await addKeys(keysToAdd);
      await loadPlayerStats(); // Reload stats after adding keys
    } catch (err: any) {
      console.error("Error adding keys:", err);
      setActionError(err.message || "Failed to add keys");
    } finally {
      setAddKeysLoading(false);
    }
  };

  // Function to convert keys to points
  const handleConvertKeysToPoints = async () => {
    try {
      setConvertLoading(true);
      setActionError(null);
      await convertKeysToPoints(keysToConvert);
      await loadPlayerStats(); // Reload stats after converting
      await loadBadges(); // Reload badges after converting (might have earned new badges)
    } catch (err: any) {
      console.error("Error converting keys to points:", err);
      setActionError(err.message || "Failed to convert keys to points");
    } finally {
      setConvertLoading(false);
    }
  };

  // Badge types
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

  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  // Check if claim is available
  const canClaim = playerStats && Date.now() / 1000 > playerStats.nextClaimTime;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Web3 Connection</h2>

      {!isConnected ? (
        <div className="mb-6">
          <p className="mb-4">
            Connect your wallet to view and manage your achievements
          </p>
          <button
            onClick={connectWallet}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Connect Wallet
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      ) : (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <p>
              Connected:{" "}
              <span className="font-mono bg-gray-800 border border-blue-500 px-2 py-1 rounded text-blue-400">
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </span>
            </p>
            <button
              onClick={disconnectWallet}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Disconnect Wallet
            </button>
          </div>

          {/* Player Stats */}
          <div className="mb-6 bg-gray-700 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Your Stats</h3>
            {statsLoading ? (
              <p>Loading stats...</p>
            ) : playerStats ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-400">Points</p>
                  <p className="text-xl">{playerStats.points}</p>
                </div>
                <div>
                  <p className="text-gray-400">Keys</p>
                  <p className="text-xl">{playerStats.keys}</p>
                </div>
                <div>
                  <p className="text-gray-400">High Score</p>
                  <p className="text-xl">{playerStats.highScore}</p>
                </div>
                <div>
                  <p className="text-gray-400">Current Score</p>
                  <p className="text-xl">{playerStats.currentScore}</p>
                </div>
                <div>
                  <p className="text-gray-400">Current Level</p>
                  <p className="text-xl">{playerStats.currentLevel}</p>
                </div>
                <div>
                  <p className="text-gray-400">Highest Level</p>
                  <p className="text-xl">{playerStats.highestLevel}</p>
                </div>
                <div className="md:col-span-3">
                  <p className="text-gray-400">Next Point Claim</p>
                  <p className="text-sm">
                    {formatDate(playerStats.nextClaimTime)}
                  </p>
                  <button
                    onClick={handleClaimDailyPoints}
                    disabled={claimLoading || !canClaim}
                    className={`mt-2 px-3 py-1 rounded text-sm ${
                      canClaim
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gray-600 cursor-not-allowed"
                    }`}
                  >
                    {claimLoading ? "Claiming..." : "Claim Daily Point"}
                  </button>
                </div>
              </div>
            ) : (
              <p>No stats available</p>
            )}
          </div>

          {/* Keys Management */}
          <div className="mb-6 bg-gray-700 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Keys Management</h3>
            <p className="text-sm text-gray-400 mb-4">
              Convert your keys to points: {playerStats?.keysPerPointConversion}{" "}
              keys = {playerStats?.pointsPerConversion} points
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Add Keys (for testing) */}
              <div>
                <p className="text-gray-400 mb-2">Add Keys (Testing)</p>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    value={keysToAdd}
                    onChange={(e) =>
                      setKeysToAdd(parseInt(e.target.value) || 0)
                    }
                    className="bg-gray-800 text-white px-3 py-1 rounded mr-2 w-20"
                  />
                  <button
                    onClick={handleAddKeys}
                    disabled={addKeysLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    {addKeysLoading ? "Adding..." : "Add Keys"}
                  </button>
                </div>
              </div>

              {/* Convert Keys to Points */}
              <div>
                <p className="text-gray-400 mb-2">Convert Keys to Points</p>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="50"
                    step="50"
                    value={keysToConvert}
                    onChange={(e) =>
                      setKeysToConvert(parseInt(e.target.value) || 50)
                    }
                    className="bg-gray-800 text-white px-3 py-1 rounded mr-2 w-20"
                  />
                  <button
                    onClick={handleConvertKeysToPoints}
                    disabled={
                      convertLoading ||
                      (playerStats &&
                        parseInt(playerStats.keys) < keysToConvert)
                    }
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                  >
                    {convertLoading ? "Converting..." : "Convert"}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Will give you{" "}
                  {(keysToConvert /
                    parseInt(playerStats?.keysPerPointConversion || "50")) *
                    parseInt(playerStats?.pointsPerConversion || "10")}{" "}
                  points
                </p>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Your Badges</h3>
            {loading ? (
              <p>Loading badges...</p>
            ) : badges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((badge, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg">
                    <div className="relative w-full h-36 mb-3 rounded-lg overflow-hidden">
                      <Image
                        src={getBadgeImage(badge.type)}
                        alt={badge.type}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-blue-600 p-1 rounded-full">
                        <Trophy className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <p className="font-bold">{badge.type}</p>
                    <p className="text-sm text-gray-400">
                      Score: {badge.score}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No badges yet. Earn points to get badges!</p>
            )}
          </div>

          {/* Top Scores */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Top Scores</h3>
            {scoresLoading ? (
              <p>Loading top scores...</p>
            ) : topScores.length > 0 ? (
              <div className="bg-gray-700 p-4 rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Rank</th>
                      <th className="text-left">Player</th>
                      <th className="text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topScores.map((score, index) => (
                      <tr
                        key={index}
                        className={
                          account && score.player === account
                            ? "text-yellow-400"
                            : ""
                        }
                      >
                        <td>{index + 1}</td>
                        <td>
                          {score.player.slice(0, 6)}...{score.player.slice(-4)}
                        </td>
                        <td className="text-right">{score.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No scores available</p>
            )}
          </div>

          {/* Badges Information */}
          <div>
            <h3 className="text-xl font-semibold mb-2">Available Badges</h3>
            <p className="mb-4 text-sm text-gray-400">
              Collect points by claiming daily points and converting keys to
              earn these badges.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badgeTypes.map((badge) => {
                const earned = badges?.some(
                  (b) => b.type.toLowerCase() === badge.name.toLowerCase()
                );
                return (
                  <div key={badge.id} className="bg-gray-700 p-4 rounded-lg">
                    <div className="relative w-full h-36 mb-3 rounded-lg overflow-hidden">
                      <Image
                        src={badge.image}
                        alt={badge.name}
                        fill
                        className="object-cover"
                      />
                      {earned && (
                        <div className="absolute top-2 right-2 bg-green-600 p-1 rounded-full">
                          <Trophy className="h-4 w-4 text-white" />
                        </div>
                      )}
                      {!earned && playerStats && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                          <span className="text-2xl">🔒</span>
                        </div>
                      )}
                    </div>
                    <p className="font-bold">{badge.name}</p>
                    <p className="text-sm text-gray-400 mb-2">
                      {badge.description}
                    </p>
                    <p className="text-sm text-gray-400 mb-2">
                      Required Points: {badge.score}
                    </p>
                    <div
                      className={`h-2 w-full bg-gray-600 rounded-full overflow-hidden ${
                        playerStats ? "" : "opacity-50"
                      }`}
                    >
                      {playerStats && (
                        <div
                          className="h-full bg-blue-500"
                          style={{
                            width: `${Math.min(
                              (parseInt(playerStats.points) / badge.score) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      )}
                    </div>
                    {playerStats && (
                      <p className="text-xs text-right mt-1 text-gray-400">
                        {parseInt(playerStats.points) >= badge.score
                          ? "Completed!"
                          : `${playerStats.points}/${badge.score} points`}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {actionError && <p className="text-red-500 mt-2">{actionError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
