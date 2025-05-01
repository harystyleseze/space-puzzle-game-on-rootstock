"use client";

import React, { useState, useEffect } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { NETWORKS } from "@/utils/networkUtils";
import { Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function FaucetButton() {
  const { account, isConnected, currentChainId } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [isTestnet, setIsTestnet] = useState(false);

  // Check if we're on testnet based on the current chain ID
  useEffect(() => {
    if (currentChainId) {
      setIsTestnet(currentChainId === NETWORKS.CORE_TESTNET.chainId);
    }
  }, [currentChainId]);

  // Only show on Core Testnet (chain ID 1114)
  if (!isConnected || !isTestnet) {
    return null;
  }

  const requestFaucet = async () => {
    if (!account || !currentChainId) return;

    setIsLoading(true);
    try {
      // Call the API route that will handle the faucet request
      const response = await fetch("/api/faucet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: account,
          chainId: currentChainId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to request tokens from faucet");
      }

      toast({
        title: "Success!",
        description:
          "Testnet tokens have been requested. They should arrive shortly.",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Faucet request error:", error);
      toast({
        title: "Request Failed",
        description:
          error.message || "Failed to request tokens. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={requestFaucet}
      disabled={isLoading}
      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2"
      size="sm"
    >
      <Droplet className="h-4 w-4" />
      {isLoading ? "Requesting..." : "Get Testnet CORE"}
    </Button>
  );
}
