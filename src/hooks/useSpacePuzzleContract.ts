import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { SpacePuzzleGameABI, CONTRACT_ADDRESSES } from "@/lib/contracts";
import {
  isCorrectNetwork,
  switchToCorrectNetwork,
  getCurrentChainId,
  getNetworkName,
} from "@/utils/networkUtils";

// Add type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useSpacePuzzleContract() {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [currentChainId, setCurrentChainId] = useState<string | null>(null);

  // Initialize provider and contract
  useEffect(() => {
    const init = async () => {
      try {
        // Check if window.ethereum is available
        if (typeof window !== "undefined" && window.ethereum) {
          // Create provider
          const ethersProvider = new ethers.providers.Web3Provider(
            window.ethereum
          );
          setProvider(ethersProvider);

          // Get current chain ID
          const chainId = await getCurrentChainId();
          setCurrentChainId(chainId);

          // No longer set network errors - both networks are allowed
          setNetworkError(null);

          // Get signer
          const ethersSigner = ethersProvider.getSigner();
          setSigner(ethersSigner);

          // Create contract instance
          const contractAddress = CONTRACT_ADDRESSES.SpacePuzzleGame;
          if (!contractAddress) {
            throw new Error("Contract address not configured");
          }

          const contractInstance = new ethers.Contract(
            contractAddress,
            SpacePuzzleGameABI,
            ethersSigner
          );
          setContract(contractInstance);

          // Get connected accounts
          const accounts = await ethersProvider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
          }
        } else {
          throw new Error(
            "Ethereum provider not found. Please install MetaMask."
          );
        }
      } catch (err: any) {
        console.error("Failed to initialize contract:", err);
        setError(err.message || "Failed to initialize contract");
      }
    };

    init();

    // Listen for network changes
    if (typeof window !== "undefined" && window.ethereum) {
      const handleChainChanged = async (chainId: string) => {
        setCurrentChainId(chainId);
        // No longer set network errors - both networks are allowed
        setNetworkError(null);
        window.location.reload();
      };

      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  // Connect wallet function
  const connectWallet = async () => {
    try {
      if (!provider) {
        throw new Error("Provider not initialized");
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setAccount(accounts[0]);
      setIsConnected(true);

      // Update signer after connection
      const ethersSigner = provider.getSigner();
      setSigner(ethersSigner);

      // Update contract with new signer
      if (contract) {
        setContract(contract.connect(ethersSigner));
      }

      return accounts[0];
    } catch (err: any) {
      console.error("Error connecting wallet:", err);
      setError(err.message || "Failed to connect wallet");
      throw err;
    }
  };

  // Switch network function - now allows specifying which network
  const switchNetwork = async (
    targetNetwork: "mainnet" | "testnet" = "testnet"
  ) => {
    try {
      const result = await switchToCorrectNetwork(targetNetwork);
      return result;
    } catch (err: any) {
      console.error("Error switching network:", err);
      setError(err.message || "Failed to switch network");
      throw err;
    }
  };

  // Disconnect wallet function
  const disconnectWallet = async () => {
    try {
      // Clear account and connection state
      setAccount(null);
      setIsConnected(false);

      // Note: MetaMask doesn't have a direct "disconnect" method
      // We're just clearing the local state

      return true;
    } catch (err: any) {
      console.error("Error disconnecting wallet:", err);
      setError(err.message || "Failed to disconnect wallet");
      throw err;
    }
  };

  // Function to update high score
  const updateHighScore = async (score: number) => {
    try {
      if (!contract || !isConnected) {
        throw new Error("Contract not initialized or wallet not connected");
      }

      const tx = await contract.updateHighScore(score);
      await tx.wait();
      return tx;
    } catch (err: any) {
      console.error("Error updating high score:", err);
      setError(err.message || "Failed to update high score");
      throw err;
    }
  };

  // Function to update current score
  const updateCurrentScore = async (score: number) => {
    try {
      if (!contract || !isConnected) {
        throw new Error("Contract not initialized or wallet not connected");
      }

      const tx = await contract.updateCurrentScore(score);
      await tx.wait();
      return tx;
    } catch (err: any) {
      console.error("Error updating current score:", err);
      setError(err.message || "Failed to update current score");
      throw err;
    }
  };

  // Function to update current level
  const updateCurrentLevel = async (level: number) => {
    try {
      if (!contract || !isConnected) {
        throw new Error("Contract not initialized or wallet not connected");
      }

      const tx = await contract.updateCurrentLevel(level);
      await tx.wait();
      return tx;
    } catch (err: any) {
      console.error("Error updating current level:", err);
      setError(err.message || "Failed to update current level");
      throw err;
    }
  };

  // Function to update highest level
  const updateHighestLevel = async (level: number) => {
    try {
      if (!contract || !isConnected) {
        throw new Error("Contract not initialized or wallet not connected");
      }

      const tx = await contract.updateHighestLevel(level);
      await tx.wait();
      return tx;
    } catch (err: any) {
      console.error("Error updating highest level:", err);
      setError(err.message || "Failed to update highest level");
      throw err;
    }
  };

  // Function to add keys
  const addKeys = async (amount: number) => {
    try {
      if (!contract || !isConnected) {
        throw new Error("Contract not initialized or wallet not connected");
      }

      const tx = await contract.addKeys(amount);
      await tx.wait();
      return tx;
    } catch (err: any) {
      console.error("Error adding keys:", err);
      setError(err.message || "Failed to add keys");
      throw err;
    }
  };

  // Function to remove keys
  const removeKeys = async (amount: number) => {
    try {
      if (!contract || !isConnected) {
        throw new Error("Contract not initialized or wallet not connected");
      }

      const tx = await contract.removeKeys(amount);
      await tx.wait();
      return tx;
    } catch (err: any) {
      console.error("Error removing keys:", err);
      setError(err.message || "Failed to remove keys");
      throw err;
    }
  };

  // Function to convert keys to points
  const convertKeysToPoints = async (keyAmount: number) => {
    try {
      if (!contract || !isConnected) {
        throw new Error("Contract not initialized or wallet not connected");
      }

      const tx = await contract.convertKeysToPoints(keyAmount);
      await tx.wait();
      return tx;
    } catch (err: any) {
      console.error("Error converting keys to points:", err);
      setError(err.message || "Failed to convert keys to points");
      throw err;
    }
  };

  // Function to claim daily points
  const claimDailyPoints = async () => {
    try {
      if (!contract || !isConnected) {
        throw new Error("Contract not initialized or wallet not connected");
      }

      // Check if user can claim before attempting transaction
      const playerStats = await getPlayerStats();
      const currentTime = Math.floor(Date.now() / 1000);

      if (playerStats.nextClaimTime > currentTime) {
        const timeLeft = playerStats.nextClaimTime - currentTime;
        throw new Error(
          `Cannot claim yet. Please wait ${Math.floor(
            timeLeft / 60
          )} minutes and ${timeLeft % 60} seconds.`
        );
      }

      console.log("Attempting to claim daily points...");
      const tx = await contract.claimDailyPoints();
      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      return tx;
    } catch (err: any) {
      console.error("Error claiming daily points:", err);
      setError(err.message || "Failed to claim daily points");
      throw err;
    }
  };

  // Function to get player badges
  const getPlayerBadges = async (playerAddress?: string) => {
    try {
      if (!contract) {
        throw new Error("Contract not initialized");
      }

      const address = playerAddress || account;
      if (!address) {
        throw new Error("No address provided");
      }

      const badgesArray = await contract.getPlayerBadges(address);

      const badges = [];
      if (badgesArray[0]) {
        // Bronze
        badges.push({
          id: 1,
          type: "Bronze Explorer",
          score: await contract.BRONZE_THRESHOLD(),
        });
      }
      if (badgesArray[1]) {
        // Silver
        badges.push({
          id: 2,
          type: "Silver Navigator",
          score: await contract.SILVER_THRESHOLD(),
        });
      }
      if (badgesArray[2]) {
        // Gold
        badges.push({
          id: 3,
          type: "Gold Commander",
          score: await contract.GOLD_THRESHOLD(),
        });
      }

      return badges;
    } catch (err: any) {
      console.error("Error getting player badges:", err);
      setError(err.message || "Failed to get player badges");
      throw err;
    }
  };

  // Function to get player stats
  const getPlayerStats = async (playerAddress?: string) => {
    try {
      if (!contract) {
        throw new Error("Contract not initialized");
      }

      const address = playerAddress || account;
      if (!address) {
        throw new Error("No address provided");
      }

      const points = await contract.getPlayerPoints(address);
      const keys = await contract.getPlayerKeys(address);
      const highScore = await contract.getPlayerHighScore(address);
      const currentScore = await contract.getPlayerCurrentScore(address);
      const currentLevel = await contract.getPlayerCurrentLevel(address);
      const highestLevel = await contract.getPlayerHighestLevel(address);
      const nextClaimTime = await contract.getNextClaimTime(address);
      const keysPerPointConversion = await contract.KEYS_PER_POINT_CONVERSION();
      const pointsPerConversion = await contract.POINTS_PER_CONVERSION();

      // Log for debugging
      console.log("Raw nextClaimTime from contract:", nextClaimTime.toString());
      console.log("Current timestamp:", Math.floor(Date.now() / 1000));

      // Ensure nextClaimTime is properly converted to a number
      const nextClaimTimeNumber = nextClaimTime.toNumber
        ? nextClaimTime.toNumber()
        : parseInt(nextClaimTime.toString());

      return {
        points: points.toString(),
        keys: keys.toString(),
        highScore: highScore.toString(),
        currentScore: currentScore.toString(),
        currentLevel: currentLevel.toString(),
        highestLevel: highestLevel.toString(),
        nextClaimTime: nextClaimTimeNumber,
        keysPerPointConversion: keysPerPointConversion.toString(),
        pointsPerConversion: pointsPerConversion.toString(),
      };
    } catch (err: any) {
      console.error("Error getting player stats:", err);
      setError(err.message || "Failed to get player stats");
      throw err;
    }
  };

  // Function to get top scores
  const getTopScores = async () => {
    try {
      if (!contract) {
        throw new Error("Contract not initialized");
      }

      const topScores = await contract.getTopScores();
      return topScores.map((score: any) => ({
        player: score.player,
        score: score.score.toString(),
      }));
    } catch (err: any) {
      console.error("Error getting top scores:", err);
      setError(err.message || "Failed to get top scores");
      throw err;
    }
  };

  return {
    contract,
    provider,
    signer,
    account,
    isConnected,
    error,
    networkError,
    currentChainId,
    connectWallet,
    disconnectWallet,
    updateHighScore,
    updateCurrentScore,
    updateCurrentLevel,
    updateHighestLevel,
    addKeys,
    removeKeys,
    convertKeysToPoints,
    claimDailyPoints,
    getPlayerBadges,
    getPlayerStats,
    getTopScores,
    switchNetwork,
  };
}
