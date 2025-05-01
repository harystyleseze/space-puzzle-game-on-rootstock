import SpacePuzzleGameABI from "./SpacePuzzleGame.json";

// Contract addresses - update these with your deployed contract addresses
const CONTRACT_ADDRESSES = {
  // Use environment variables or update manually after deployment
  SpacePuzzleGame: process.env.NEXT_PUBLIC_SPACE_PUZZLE_GAME_ADDRESS || "",
};

export { SpacePuzzleGameABI, CONTRACT_ADDRESSES };

// Helper function to get contract config
export const getContractConfig = (contractName: "SpacePuzzleGame") => {
  return {
    address: CONTRACT_ADDRESSES[contractName],
    abi: contractName === "SpacePuzzleGame" ? SpacePuzzleGameABI : [],
  };
};
