"use client";

import React from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import {
  getCurrentNetwork,
  NETWORKS,
  getNetworkName,
} from "@/utils/networkUtils";

export default function NetworkWarning() {
  // Always return null to never show the warning
  return null;

  // Original code is commented out below, but updated with the new parameter
  /*
  const { networkError, isConnected, currentChainId, switchNetwork } =
    useWeb3();
  const [isLoading, setIsLoading] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);

  const handleSwitchNetwork = async (targetNetwork: 'mainnet' | 'testnet' = 'testnet') => {
    setIsLoading(true);
    try {
      await switchNetwork(targetNetwork);
      // The page will reload automatically due to the chainChanged event listener
    } catch (error) {
      console.error("Failed to switch network:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Store in localStorage to remember user's preference
    localStorage.setItem("network-warning-dismissed", "true");
  };

  // Check if the warning was previously dismissed
  React.useEffect(() => {
    const isDismissed =
      localStorage.getItem("network-warning-dismissed") === "true";
    setDismissed(isDismissed);
  }, []);

  // If not connected, no error, or dismissed, don't show anything
  if (!isConnected || !networkError || dismissed) return null;

  const currentNetwork = getCurrentNetwork();
  const currentNetworkName = getNetworkName(currentChainId);
  const isMainnet = currentChainId === NETWORKS.CORE_MAINNET.chainId;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-white p-3 shadow-lg">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-2 sm:mb-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="font-medium">
            You're currently on {currentNetworkName}. Some features may only be
            available on specific networks.
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleSwitchNetwork(isMainnet ? 'testnet' : 'mainnet')}
            disabled={isLoading}
            className="bg-white text-amber-600 px-4 py-1 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Switching..." : `Switch to ${isMainnet ? 'Testnet' : 'Mainnet'}`}
          </button>
          <button
            onClick={handleDismiss}
            className="bg-transparent border border-white text-white px-4 py-1 rounded-lg font-medium hover:bg-amber-700 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
  */
}
