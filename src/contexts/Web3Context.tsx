"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSpacePuzzleContract } from "@/hooks/useSpacePuzzleContract";
import {
  toBigNumberToNumber,
  toBigNumberToString,
} from "@/utils/bigNumberUtils";
import { switchToCorrectNetwork } from "@/utils/networkUtils";

// Define the shape of our context
export interface Web3ContextType {
  account: string | null;
  isConnected: boolean;
  error: string | null;
  networkError: string | null;
  currentChainId: string | null;
  connectWallet: () => Promise<string>;
  disconnectWallet: () => Promise<boolean>;
  switchNetwork: (targetNetwork?: "mainnet" | "testnet") => Promise<boolean>;
  playerStats: any | null;
  badges: any[];
  topScores: any[];
  loading: {
    stats: boolean;
    badges: boolean;
    scores: boolean;
  };
  refreshData: () => Promise<void>;
  addKeys: (amount: number) => Promise<void>;
  removeKeys: (amount: number) => Promise<void>;
  convertKeysToPoints: (keyAmount: number) => Promise<void>;
  claimDailyPoints: () => Promise<void>;
  updateHighScore: (score: number) => Promise<void>;
  updateCurrentScore: (score: number) => Promise<void>;
  updateCurrentLevel: (level: number) => Promise<void>;
  updateHighestLevel: (level: number) => Promise<void>;
}

// Create the context with a default value
const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Helper function to process player stats and convert BigNumber values
const processPlayerStats = (stats: any): any => {
  if (!stats) return null;

  return {
    ...stats,
    points: toBigNumberToNumber(stats.points),
    keys: toBigNumberToNumber(stats.keys),
    highScore: toBigNumberToNumber(stats.highScore),
    currentScore: toBigNumberToNumber(stats.currentScore),
    currentLevel: toBigNumberToNumber(stats.currentLevel),
    highestLevel: toBigNumberToNumber(stats.highestLevel),
    nextClaimTime: toBigNumberToNumber(stats.nextClaimTime),
  };
};

// Helper function to process badges and convert BigNumber values
const processBadges = (badges: any[]): any[] => {
  if (!badges || !badges.length) return [];

  return badges.map((badge) => ({
    ...badge,
    score: toBigNumberToNumber(badge.score),
    type: badge.type ? toBigNumberToString(badge.type) : "1",
  }));
};

// Helper function to process scores and convert BigNumber values
const processScores = (scores: any[]): any[] => {
  if (!scores || !scores.length) return [];

  return scores.map((score) => ({
    ...score,
    score: toBigNumberToNumber(score.score),
  }));
};

// Provider component that wraps the app
export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    contract,
    provider,
    account,
    isConnected,
    error,
    networkError,
    currentChainId,
    connectWallet: hookConnectWallet,
    disconnectWallet: hookDisconnectWallet,
    switchNetwork: hookSwitchNetwork,
    getPlayerBadges,
    getPlayerStats,
    getTopScores,
    addKeys: hookAddKeys,
    removeKeys: hookRemoveKeys,
    convertKeysToPoints: hookConvertKeysToPoints,
    claimDailyPoints: hookClaimDailyPoints,
    updateHighScore: hookUpdateHighScore,
    updateCurrentScore: hookUpdateCurrentScore,
    updateCurrentLevel: hookUpdateCurrentLevel,
    updateHighestLevel: hookUpdateHighestLevel,
  } = useSpacePuzzleContract();

  const [badges, setBadges] = useState<any[]>([]);
  const [playerStats, setPlayerStats] = useState<any>(null);
  const [topScores, setTopScores] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    stats: false,
    badges: false,
    scores: false,
  });

  // Load data when account changes
  useEffect(() => {
    if (isConnected && account) {
      refreshData();
    }
  }, [isConnected, account]);

  // Function to refresh all data
  const refreshData = async () => {
    if (!isConnected || !account) return;

    await Promise.all([loadBadges(), loadPlayerStats(), loadTopScores()]);
  };

  // Function to load player badges
  const loadBadges = async () => {
    try {
      setLoading((prev) => ({ ...prev, badges: true }));
      const playerBadges = await getPlayerBadges();
      setBadges(processBadges(playerBadges || []));
    } catch (err: any) {
      console.error("Error loading badges:", err);
    } finally {
      setLoading((prev) => ({ ...prev, badges: false }));
    }
  };

  // Function to load player stats
  const loadPlayerStats = async () => {
    try {
      setLoading((prev) => ({ ...prev, stats: true }));
      const stats = await getPlayerStats();
      setPlayerStats(processPlayerStats(stats));
    } catch (err: any) {
      console.error("Error loading player stats:", err);
    } finally {
      setLoading((prev) => ({ ...prev, stats: false }));
    }
  };

  // Function to load top scores
  const loadTopScores = async () => {
    try {
      setLoading((prev) => ({ ...prev, scores: true }));
      const scores = await getTopScores();
      const filteredScores = scores.filter(
        (score: any) =>
          score.player !== "0x0000000000000000000000000000000000000000"
      );
      setTopScores(processScores(filteredScores));
    } catch (err: any) {
      console.error("Error loading top scores:", err);
    } finally {
      setLoading((prev) => ({ ...prev, scores: false }));
    }
  };

  // Connect wallet function
  const connectWallet = async () => {
    return await hookConnectWallet();
  };

  // Switch network function
  const switchNetwork = async (targetNetwork?: "mainnet" | "testnet") => {
    try {
      const result = await switchToCorrectNetwork(targetNetwork);
      return result;
    } catch (err: any) {
      console.error("Error switching network:", err);
      throw err;
    }
  };

  // Add keys function
  const addKeys = async (amount: number) => {
    try {
      await hookAddKeys(amount);
      await loadPlayerStats();
    } catch (err: any) {
      console.error("Error adding keys:", err);
      throw err;
    }
  };

  // Remove keys function
  const removeKeys = async (amount: number) => {
    try {
      await hookRemoveKeys(amount);
      await loadPlayerStats();
    } catch (err: any) {
      console.error("Error removing keys:", err);
      throw err;
    }
  };

  // Convert keys to points function
  const convertKeysToPoints = async (keyAmount: number) => {
    try {
      await hookConvertKeysToPoints(keyAmount);
      await Promise.all([loadPlayerStats(), loadBadges()]);
    } catch (err: any) {
      console.error("Error converting keys to points:", err);
      throw err;
    }
  };

  // Claim daily points function
  const claimDailyPoints = async () => {
    try {
      await hookClaimDailyPoints();
      await Promise.all([loadPlayerStats(), loadBadges()]);
    } catch (err: any) {
      console.error("Error claiming daily points:", err);
      throw err;
    }
  };

  // Update high score function
  const updateHighScore = async (score: number) => {
    try {
      await hookUpdateHighScore(score);
      await Promise.all([loadPlayerStats(), loadTopScores()]);
    } catch (err: any) {
      console.error("Error updating high score:", err);
      throw err;
    }
  };

  // Update current score function
  const updateCurrentScore = async (score: number) => {
    try {
      await hookUpdateCurrentScore(score);
      await loadPlayerStats();
    } catch (err: any) {
      console.error("Error updating current score:", err);
      throw err;
    }
  };

  // Update current level function
  const updateCurrentLevel = async (level: number) => {
    try {
      await hookUpdateCurrentLevel(level);
      await loadPlayerStats();
    } catch (err: any) {
      console.error("Error updating current level:", err);
      throw err;
    }
  };

  // Update highest level function
  const updateHighestLevel = async (level: number) => {
    try {
      await hookUpdateHighestLevel(level);
      await loadPlayerStats();
    } catch (err: any) {
      console.error("Error updating highest level:", err);
      throw err;
    }
  };

  // Create the context value
  const contextValue: Web3ContextType = {
    account,
    isConnected,
    error,
    networkError,
    currentChainId,
    connectWallet,
    disconnectWallet: hookDisconnectWallet,
    switchNetwork,
    playerStats,
    badges,
    topScores,
    loading,
    refreshData,
    addKeys,
    removeKeys,
    convertKeysToPoints,
    claimDailyPoints,
    updateHighScore,
    updateCurrentScore,
    updateCurrentLevel,
    updateHighestLevel,
  };

  return (
    <Web3Context.Provider value={contextValue}>{children}</Web3Context.Provider>
  );
};

// Custom hook to use the Web3 context
export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}
