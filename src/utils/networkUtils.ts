/**
 * Network utility functions for Core blockchain networks
 */

// Core network configurations
export const NETWORKS = {
  ROOTSTOCK_TESTNET: {
    chainId: "0x1f", // 31 in decimal
    chainName: "Rootstock Testnet",
    nativeCurrency: {
      name: "RBTC",
      symbol: "tRBTC",
      decimals: 18,
    },
    rpcUrls: ["https://public-node.testnet.rsk.co"],
    blockExplorerUrls: ["https://explorer.testnet.rootstock.io"],
  },
  CORE_TESTNET: {
    chainId: "0x45a", // 1114 in decimal
    chainName: "Core Blockchain Testnet",
    nativeCurrency: {
      name: "CORE",
      symbol: "CORE",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.test2.btcs.network"],
    blockExplorerUrls: ["https://scan.test2.btcs.network"],
  },
  CORE_MAINNET: {
    chainId: "0x45c", // 1116 in decimal
    chainName: "Core Blockchain Mainnet",
    nativeCurrency: {
      name: "CORE",
      symbol: "CORE",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.coredao.org/"],
    blockExplorerUrls: ["https://scan.coredao.org"],
  },
};

// Get the current network ID from environment variables
export const getCurrentNetworkId = (): number => {
  return parseInt(process.env.NEXT_PUBLIC_NETWORK_ID || "13", 10);
};

// Get the current network configuration
export const getCurrentNetwork = () => {
  const networkId = getCurrentNetworkId();
  switch (networkId) {
    case 13:
      return NETWORKS.ROOTSTOCK_TESTNET;
    case 1114:
      return NETWORKS.CORE_TESTNET;
    case 1116:
      return NETWORKS.CORE_MAINNET;
    default:
      return null;
  }
};

/**
 * Get the current chain ID from the wallet
 */
export const getCurrentChainId = async (): Promise<string | null> => {
  if (typeof window === "undefined" || !window.ethereum) {
    return null;
  }

  try {
    return await window.ethereum.request({ method: "eth_chainId" });
  } catch (error) {
    console.error("Error getting chain ID:", error);
    return null;
  }
};

/**
 * Switch to the specified Core network
 * This is now optional and only used when explicitly requested
 * @param targetNetwork 'mainnet' or 'testnet' to specify which network to switch to
 */
export const switchToCorrectNetwork = async (
  targetNetwork: "mainnet" | "testnet" = "testnet"
): Promise<boolean> => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Ethereum provider not found. Please install MetaMask.");
  }

  // Choose the network based on the specified target
  const network =
    targetNetwork === "mainnet" ? NETWORKS.CORE_MAINNET : NETWORKS.CORE_TESTNET;

  try {
    // Try to switch to the network
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: network.chainId }],
    });
    return true;
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [network],
        });
        return true;
      } catch (addError) {
        console.error("Error adding network:", addError);
        throw new Error("Failed to add network to your wallet.");
      }
    } else {
      console.error("Error switching network:", switchError);
      throw new Error("Failed to switch network. Please try manually.");
    }
  }
};

/**
 * Check if the user is connected to the expected network based on environment
 * This is now informational only and doesn't force switching
 */
export const isCorrectNetwork = async (): Promise<boolean> => {
  if (typeof window === "undefined" || !window.ethereum) {
    return false;
  }

  try {
    const currentChainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    const targetChainId = getCurrentNetwork().chainId;
    return currentChainId === targetChainId;
  } catch (error) {
    console.error("Error checking network:", error);
    return false;
  }
};

/**
 * Get network name from chain ID
 */
export const getNetworkName = (chainId: string | null): string => {
  if (!chainId) return "Unknown Network";

  if (chainId === NETWORKS.ROOTSTOCK_TESTNET.chainId) {
    return "Rootstock Testnet";
  } else if (chainId === NETWORKS.CORE_MAINNET.chainId) {
    return "Core Mainnet";
  } else {
    return "Unknown Network";
  }
};
