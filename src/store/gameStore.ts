import { create } from "zustand";
import { LevelConfig } from "@/types/game";

interface GameState {
  score: number;
  level: number;
  keysCollected: number;
  highScore: number;
  totalKeys: number;
  gameOver: boolean;
  // Achievement tracking
  levelsCompleted: number;
  achievements: {
    bronzeExplorer: boolean;
    silverNavigator: boolean;
    goldCommander: boolean;
  };
  calculateDifficulty: () => LevelConfig;
  getLevelConfig: () => LevelConfig;
  completeLevel: () => number;
  resetGame: () => void;
  collectKey: () => void;
  useKey: (amount?: number) => boolean;
  loseKeys: (amount: number) => void;
  getTotalKeys: () => number;
  // Achievement methods
  checkAchievements: () => void;
  getAchievements: () => { id: number; name: string; unlocked: boolean }[];
}

export const useGameStore = create<GameState>((set, get) => ({
  score: 0,
  level: 1,
  keysCollected: 0,
  highScore: 0,
  totalKeys: 0,
  gameOver: false,
  // Achievement tracking
  levelsCompleted: 0,
  achievements: {
    bronzeExplorer: false,
    silverNavigator: false,
    goldCommander: false,
  },

  calculateDifficulty: () => {
    const { level } = get();
    const baseDifficulty = Math.log(level + 1) / Math.log(2);

    return {
      numKeys: Math.min(Math.round(1 + baseDifficulty * 0.5), 4),
      numBarriers: Math.min(Math.round(2 + baseDifficulty), 8),
      numAsteroids: Math.min(Math.round(3 + baseDifficulty * 1.5), 12),
      numTeleporters: Math.min(Math.max(0, Math.round(baseDifficulty - 1)), 3),
      numBokoharams:
        level >= 4 ? Math.min(Math.round(1 + (level - 4) * 0.5), 3) : 0,
      gridSize: [6, 5] as [number, number],
      difficultyMultiplier: 1.0 + baseDifficulty * 0.2,
      level,
    };
  },

  getLevelConfig: () => {
    return get().calculateDifficulty();
  },

  completeLevel: () => {
    const config = get().calculateDifficulty();
    const levelScore = Math.round(
      100 * get().level * config.difficultyMultiplier
    );

    set((state) => ({
      score: state.score + levelScore,
      level: state.level + 1,
      totalKeys: state.totalKeys + state.keysCollected,
      keysCollected: 0,
      highScore: Math.max(state.highScore, state.score + levelScore),
      levelsCompleted: state.levelsCompleted + 1,
    }));

    // Check for achievements after completing a level
    get().checkAchievements();

    return levelScore;
  },

  resetGame: () => {
    const { highScore, achievements } = get();
    set({
      score: 0,
      level: 1,
      keysCollected: 0,
      totalKeys: 0,
      gameOver: false,
      highScore, // Maintain high score
      levelsCompleted: 0,
      achievements, // Maintain achievements
    });
  },

  collectKey: () => {
    set((state) => ({
      keysCollected: state.keysCollected + 1,
      totalKeys: state.totalKeys + 1,
    }));
  },

  useKey: (amount = 1) => {
    const { totalKeys } = get();
    if (totalKeys >= amount) {
      set((state) => ({
        totalKeys: state.totalKeys - amount,
      }));
      return true;
    }
    set({ gameOver: true });
    return false;
  },

  loseKeys: (amount) => {
    set((state) => {
      const newTotal = Math.max(0, state.totalKeys - amount);
      const gameOver = newTotal <= 0;

      return {
        totalKeys: newTotal,
        gameOver: gameOver || state.gameOver,
      };
    });
  },

  getTotalKeys: () => {
    return get().totalKeys;
  },

  // Achievement methods
  checkAchievements: () => {
    const { levelsCompleted, achievements } = get();

    // Check for new achievements
    const newAchievements = {
      ...achievements,
      bronzeExplorer: achievements.bronzeExplorer || levelsCompleted >= 5,
      silverNavigator: achievements.silverNavigator || levelsCompleted >= 10,
      goldCommander: achievements.goldCommander || levelsCompleted >= 20,
    };

    // Update achievements if changed
    if (JSON.stringify(achievements) !== JSON.stringify(newAchievements)) {
      set({ achievements: newAchievements });

      // Here you could trigger blockchain interactions
      // For example, call a function to mint badges for newly unlocked achievements
    }
  },

  getAchievements: () => {
    const { achievements } = get();

    return [
      {
        id: 1,
        name: "Bronze Explorer",
        unlocked: achievements.bronzeExplorer,
      },
      {
        id: 2,
        name: "Silver Navigator",
        unlocked: achievements.silverNavigator,
      },
      {
        id: 3,
        name: "Gold Commander",
        unlocked: achievements.goldCommander,
      },
    ];
  },
}));
