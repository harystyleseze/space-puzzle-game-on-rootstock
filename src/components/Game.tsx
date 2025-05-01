"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import useSound from "use-sound";
import { useGameStore } from "@/store/gameStore";
import { GameEngine } from "@/lib/gameEngine";
import { GameObjects } from "@/types/game";
import { useWeb3 } from "@/contexts/Web3Context";
import { useRouter } from "next/navigation";

const WINDOW_WIDTH = 660;
const WINDOW_HEIGHT = 600;
const GRID_SIZE = 80;

export default function Game() {
  const router = useRouter();
  const {
    updateHighScore,
    updateCurrentScore,
    updateCurrentLevel,
    updateHighestLevel,
    addKeys,
    playerStats,
    disconnectWallet,
  } = useWeb3();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngine = useRef<GameEngine | null>(null);
  const [gameObjects, setGameObjects] = useState<GameObjects | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const touchThreshold = 30; // minimum swipe distance in pixels
  const [notification, setNotification] = useState<string | null>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    score,
    level,
    highScore,
    totalKeys,
    gameOver,
    getLevelConfig,
    completeLevel,
    resetGame,
    collectKey,
    useKey,
    loseKeys,
  } = useGameStore();

  // Initialize game engine on client side only
  useEffect(() => {
    if (!gameEngine.current) {
      gameEngine.current = new GameEngine();
      const levelConfig = getLevelConfig();
      if (levelConfig) {
        const initialGameObjects =
          gameEngine.current.generateLevel(levelConfig);
        setGameObjects(initialGameObjects);
      }
    }
  }, [getLevelConfig]);

  // Load sounds
  const [playCollect] = useSound("/sounds/laser.wav");
  const [playComplete] = useSound("/sounds/explosion2.wav");
  const [playError] = useSound("/sounds/explosion.wav");

  // Load images
  const images = useRef<{ [key: string]: HTMLImageElement }>({});
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    const imageUrls = {
      bg: "/images/bg.png",
      spaceship: "/images/spaceship.png",
      asteroid: "/images/alien1.png",
      key: "/images/alien_bullet.png",
      portal: "/images/alien3.png",
      barrier: "/images/alien4.png",
      bokoharam: "/images/alien5.png",
    };

    const loadImages = async () => {
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = () => resolve(img);
          img.onerror = reject;
        });
      };

      try {
        const loadedImages = await Promise.all(
          Object.entries(imageUrls).map(async ([key, url]) => {
            const img = await loadImage(url);
            return [key, img];
          })
        );

        images.current = Object.fromEntries(loadedImages);
        setImagesLoaded(true);
      } catch (error) {
        console.error("Failed to load images:", error);
      }
    };

    loadImages();
  }, []);

  useEffect(() => {
    if (!imagesLoaded || !gameEngine.current) return;

    const config = getLevelConfig();
    const objects = gameEngine.current.generateLevel(config);
    setGameObjects(objects);
  }, [imagesLoaded, getLevelConfig]);

  // Function to show a temporary notification
  const showNotification = (message: string, duration: number = 2000) => {
    setNotification(message);

    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }

    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
      notificationTimeoutRef.current = null;
    }, duration);
  };

  const drawGame = (ctx: CanvasRenderingContext2D) => {
    if (!gameEngine.current || !gameObjects || !imagesLoaded) return;

    // Clear canvas
    ctx.clearRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);

    // Draw background
    ctx.drawImage(images.current.bg, 0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);

    // Draw stats background
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, WINDOW_WIDTH, 80);

    // Draw stats with improved positioning
    ctx.font = "20px helvetica";
    ctx.fillStyle = "white";
    ctx.textAlign = "left";

    // Left side stats
    ctx.fillText(`Level: ${level}`, 20, 30);
    ctx.fillText(`Keys: ${totalKeys}`, 20, 60);

    // Right side stats
    ctx.textAlign = "right";
    ctx.fillText(`Score: ${score}`, WINDOW_WIDTH - 20, 30);
    ctx.fillText(`High Score: ${highScore}`, WINDOW_WIDTH - 20, 60);

    // Center stats - Keys remaining
    const remainingKeys = gameObjects.keys.filter(
      (key) => !key.collected
    ).length;
    if (remainingKeys > 0) {
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.fillText(
        `Collect all keys: ${remainingKeys} remaining`,
        WINDOW_WIDTH / 2,
        30
      );
    } else {
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255, 215, 0, 0.8)"; // Gold color
      ctx.fillText("Portal activated! Proceed to exit", WINDOW_WIDTH / 2, 30);
    }

    ctx.textAlign = "left"; // Reset alignment for other drawings

    // Draw grid
    ctx.strokeStyle = "rgba(50, 50, 70, 1)";
    ctx.lineWidth = 1;
    for (let x = 0; x < 6; x++) {
      for (let y = 0; y < 5; y++) {
        ctx.strokeRect(100 + x * 80, 100 + y * 80, 80, 80);
      }
    }

    // Draw game objects
    const { spaceship, keys, portals, barriers, asteroids, teleporters } =
      gameObjects;

    // Draw spaceship
    ctx.drawImage(
      images.current.spaceship,
      spaceship.x,
      spaceship.y,
      spaceship.width,
      spaceship.height
    );

    // Draw keys
    keys.forEach((key) => {
      if (!key.collected) {
        const keyImg = images.current.key;
        ctx.save();
        ctx.fillStyle = key.color;
        ctx.globalCompositeOperation = "multiply";
        ctx.fillRect(key.x, key.y, key.width, key.height);
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(keyImg, key.x, key.y, key.width, key.height);
        ctx.restore();
      }
    });

    // Draw portals
    portals.forEach((portal) => {
      const portalImg = images.current.portal;
      ctx.save();
      if (!portal.active) {
        ctx.globalAlpha = 0.5;
      }
      ctx.drawImage(portalImg, portal.x, portal.y, portal.width, portal.height);
      ctx.restore();
    });

    // Draw barriers
    barriers.forEach((barrier) => {
      const barrierImg = images.current.barrier;
      ctx.save();
      ctx.fillStyle = barrier.color;
      ctx.globalCompositeOperation = "multiply";
      ctx.fillRect(barrier.x, barrier.y, barrier.width, barrier.height);
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(
        barrierImg,
        barrier.x,
        barrier.y,
        barrier.width,
        barrier.height
      );
      ctx.restore();
    });

    // Draw asteroids
    asteroids.forEach((asteroid) => {
      ctx.drawImage(
        images.current.asteroid,
        asteroid.x,
        asteroid.y,
        asteroid.width,
        asteroid.height
      );
    });

    // Draw teleporters
    teleporters.forEach((teleporter) => {
      ctx.beginPath();
      ctx.fillStyle = teleporter.color;
      ctx.arc(teleporter.x + 32, teleporter.y + 32, 25, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw bokoharams (alien5)
    gameObjects.bokoharams?.forEach((bokoharam) => {
      const bokoharamImg = images.current.bokoharam;
      ctx.save();
      ctx.drawImage(
        bokoharamImg,
        bokoharam.x,
        bokoharam.y,
        bokoharam.width,
        bokoharam.height
      );
      ctx.restore();
    });

    // Draw notification if exists
    if (notification) {
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(WINDOW_WIDTH / 2 - 200, WINDOW_HEIGHT / 2 - 40, 400, 80);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "white";
      ctx.font = "bold 24px helvetica";
      ctx.fillText(notification, WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2);
      ctx.restore();
    }
  };

  const animate = (time: number) => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    if (previousTimeRef.current !== undefined) {
      drawGame(ctx);

      if (gameOver) {
        // Implement game over drawing logic
      } else if (isPaused) {
        // Implement paused drawing logic
      }
    }

    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameObjects, isPaused, gameOver]);

  // Reset game state when component unmounts
  useEffect(() => {
    return () => {
      resetGame();
    };
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!gameEngine.current || !gameObjects) return;

      if (gameOver) {
        if (event.key === "r") {
          resetGame();
          const config = getLevelConfig();
          const objects = gameEngine.current.generateLevel(config);
          setGameObjects(objects);
        } else if (event.key === "Escape") {
          // Handle quit
        }
        return;
      }

      if (event.key === "p") {
        setIsPaused(!isPaused);
        return;
      }

      if (event.key === "r") {
        resetGame();
        const config = getLevelConfig();
        const objects = gameEngine.current.generateLevel(config);
        setGameObjects(objects);
        setIsPaused(false);
        return;
      }

      if (event.key === "Escape" && isPaused) {
        // Handle quit
        return;
      }

      if (!isPaused && gameObjects) {
        const { spaceship } = gameObjects;
        let newX = spaceship.gridX;
        let newY = spaceship.gridY;

        switch (event.key) {
          case "ArrowLeft":
            newX--;
            break;
          case "ArrowRight":
            newX++;
            break;
          case "ArrowUp":
            newY--;
            break;
          case "ArrowDown":
            newY++;
            break;
          default:
            return;
        }

        // Check for asteroid collision
        const asteroid = gameObjects.asteroids.find(
          (a) => a.gridX === newX && a.gridY === newY
        );
        if (asteroid) {
          playError();
          return;
        }

        if (gameEngine.current.checkMove(newX, newY)) {
          // Update spaceship position
          spaceship.gridX = newX;
          spaceship.gridY = newY;
          spaceship.x = 100 + newX * GRID_SIZE;
          spaceship.y = 100 + newY * GRID_SIZE;

          // Check for key collection
          const key = gameObjects.keys.find(
            (k) => !k.collected && k.gridX === newX && k.gridY === newY
          );
          if (key) {
            key.collected = true;
            collectKey();
            playCollect();
          }

          // Check for barrier
          const barrier = gameObjects.barriers.find(
            (b) => b.gridX === newX && b.gridY === newY
          );
          if (barrier) {
            if (useKey()) {
              gameObjects.barriers = gameObjects.barriers.filter(
                (b) => b !== barrier
              );
              playCollect();
            } else {
              playError();
              return;
            }
          }

          // Check for teleporter
          const teleporter = gameObjects.teleporters.find(
            (t) => t.gridX === newX && t.gridY === newY
          );
          if (teleporter) {
            const pair = gameObjects.teleporters.find(
              (t) => t.pairId === teleporter.pairId && t !== teleporter
            );
            if (pair) {
              spaceship.gridX = pair.gridX;
              spaceship.gridY = pair.gridY;
              spaceship.x = 100 + pair.gridX * GRID_SIZE;
              spaceship.y = 100 + pair.gridY * GRID_SIZE;
              playCollect();
            }
          }

          // Update portal status
          const allKeysCollected = gameObjects.keys.every((k) => k.collected);
          gameObjects.portals.forEach((p) => {
            p.active = allKeysCollected;
          });

          // Check for portal completion
          const portal = gameObjects.portals.find(
            (p) => p.gridX === spaceship.gridX && p.gridY === spaceship.gridY
          );
          if (portal) {
            if (portal.active && totalKeys > 0) {
              playComplete();
              completeLevel();
              const config = getLevelConfig();
              const newObjects = gameEngine.current.generateLevel(config);
              setGameObjects(newObjects);
            } else {
              playError();
              setGameObjects({ ...gameObjects });
              if (!portal.active) {
                // Show notification that all keys must be collected
                showNotification("Collect all keys to activate the portal!");
              } else if (totalKeys === 0) {
                setIsPaused(true);
                useKey(); // This will set gameOver to true when totalKeys is 0
              }
              return;
            }
          } else {
            setGameObjects({ ...gameObjects });
          }

          // Check for Bokoharam collision
          const bokoharam = gameObjects.bokoharams?.find(
            (b) => b.gridX === newX && b.gridY === newY
          );
          if (bokoharam) {
            // Subtract 5 keys when hitting Bokoharam
            playError();
            showNotification("Bokoharam attack! Lost 5 keys!", 3000);
            loseKeys(5);

            // Remove the Bokoharam after collision
            gameObjects.bokoharams = gameObjects.bokoharams.filter(
              (b) => b !== bokoharam
            );

            // Check if game over due to key loss
            if (totalKeys <= 0) {
              setIsPaused(true);
              showNotification("Game Over! No keys left!", 3000);
              return;
            }
          }
        }
      }
    },
    [gameObjects, isPaused, gameOver]
  );

  useEffect(() => {
    const keyDownListener = (event: KeyboardEvent) => {
      handleKeyDown(event);
    };

    window.addEventListener("keydown", keyDownListener);
    return () => {
      window.removeEventListener("keydown", keyDownListener);
    };
  }, [handleKeyDown]);

  // Add touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (
      !touchStart ||
      !gameEngine.current ||
      !gameObjects ||
      gameOver ||
      isPaused
    )
      return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // Only handle the swipe if it exceeds the threshold
    if (Math.abs(deltaX) < touchThreshold && Math.abs(deltaY) < touchThreshold)
      return;

    // Create a synthetic keyboard event
    const direction =
      Math.abs(deltaX) > Math.abs(deltaY)
        ? deltaX > 0
          ? "ArrowRight"
          : "ArrowLeft"
        : deltaY > 0
        ? "ArrowDown"
        : "ArrowUp";

    handleKeyDown({ key: direction } as KeyboardEvent);
    setTouchStart(null); // Reset touch start to prevent multiple moves
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  // Function to handle quitting the game
  const handleQuitGame = () => {
    setShowQuitConfirm(true);
    setIsPaused(true);
  };

  // Function to confirm quitting
  const confirmQuit = () => {
    setShowQuitConfirm(false);
    setShowSaveConfirm(true);
  };

  // Function to cancel quitting
  const cancelQuit = () => {
    setShowQuitConfirm(false);
    setIsPaused(false);
  };

  // Function to save game progress to blockchain
  const saveGameProgress = async () => {
    setIsSaving(true);
    try {
      // Update blockchain with current game state
      // Only update high score if current score is higher than previous high score
      if (score > highScore) {
        await updateHighScore(score);
      }

      // Always update current score
      await updateCurrentScore(score);

      // Always update current level
      await updateCurrentLevel(level);

      // Only update highest level if current level is higher than previous highest level
      if (playerStats) {
        console.log("Current level:", level);
        console.log("Player's highest level:", playerStats.highestLevel);

        // Convert to numbers to ensure proper comparison
        const currentLevel = Number(level);
        const highestLevel = Number(playerStats.highestLevel);

        if (currentLevel > highestLevel) {
          console.log("Updating highest level to:", currentLevel);
          try {
            await updateHighestLevel(currentLevel);
          } catch (levelError) {
            console.error("Error updating highest level:", levelError);
            // Continue with other operations even if this fails
          }
        } else {
          console.log(
            "Not updating highest level as current level is not higher"
          );
        }
      }

      // Add keys to player's account
      if (totalKeys > 0) {
        await addKeys(totalKeys);
      }

      // Show success notification
      showNotification("Game progress saved successfully!", 2000);

      // Reset the game state
      resetGame();

      // Redirect to home after saving
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Error saving game progress:", error);
      showNotification("Failed to save progress. Try again later.", 3000);
      setIsSaving(false);
      setShowSaveConfirm(false);
    }
  };

  // Function to quit without saving
  const quitWithoutSaving = () => {
    // Reset the game state before redirecting
    resetGame();
    showNotification("Game progress discarded", 1500);

    // Redirect after a short delay to show the notification
    setTimeout(() => {
      router.push("/");
    }, 1500);
  };

  // Function to cancel saving
  const cancelSave = () => {
    setShowSaveConfirm(false);
    setIsPaused(false);
  };

  // Add mobile control buttons
  const MobileControls = () => (
    <div className="fixed bottom-0 left-0 right-0 z-10 pb-4 pt-2 px-4 sm:pb-6 md:hidden">
      <div className="flex flex-col items-center">
        {/* Game controls */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-black bg-opacity-70 p-3 rounded-lg shadow-lg border border-gray-700">
          {/* Top row - special buttons */}
          <div className="col-span-3 flex justify-between mb-2">
            <button
              className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-white text-xl border-2 border-[#F89213] transition-colors"
              onClick={() => handleKeyDown({ key: "r" } as KeyboardEvent)}
              aria-label="Restart"
            >
              <span className="text-[#F89213]">R</span>
            </button>

            <button
              className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-white text-xl border-2 border-[#F89213] transition-colors"
              onClick={() => handleKeyDown({ key: "p" } as KeyboardEvent)}
              aria-label="Pause"
            >
              <span className="text-[#F89213]">P</span>
            </button>

            <button
              className="w-14 h-14 sm:w-16 sm:h-16 bg-red-900 hover:bg-red-800 rounded-lg flex items-center justify-center text-white text-xl border-2 border-red-600 transition-colors"
              onClick={handleQuitGame}
              aria-label="Quit Game"
            >
              <span className="text-white">✕</span>
            </button>
          </div>

          {/* Direction buttons */}
          <button
            className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-800 hover:bg-gray-700 active:bg-[#F89213] active:bg-opacity-30 rounded-lg flex items-center justify-center text-white text-2xl border border-gray-600 transition-colors"
            onClick={() => handleKeyDown({ key: "ArrowLeft" } as KeyboardEvent)}
            aria-label="Move Left"
          >
            ←
          </button>
          <div className="flex flex-col gap-2">
            <button
              className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-800 hover:bg-gray-700 active:bg-[#F89213] active:bg-opacity-30 rounded-lg flex items-center justify-center text-white text-2xl border border-gray-600 transition-colors"
              onClick={() => handleKeyDown({ key: "ArrowUp" } as KeyboardEvent)}
              aria-label="Move Up"
            >
              ↑
            </button>
            <button
              className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-800 hover:bg-gray-700 active:bg-[#F89213] active:bg-opacity-30 rounded-lg flex items-center justify-center text-white text-2xl border border-gray-600 transition-colors"
              onClick={() =>
                handleKeyDown({ key: "ArrowDown" } as KeyboardEvent)
              }
              aria-label="Move Down"
            >
              ↓
            </button>
          </div>
          <button
            className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-800 hover:bg-gray-700 active:bg-[#F89213] active:bg-opacity-30 rounded-lg flex items-center justify-center text-white text-2xl border border-gray-600 transition-colors"
            onClick={() =>
              handleKeyDown({ key: "ArrowRight" } as KeyboardEvent)
            }
            aria-label="Move Right"
          >
            →
          </button>
        </div>

        {/* Help text */}
        <div className="mt-2 text-xs text-gray-400 text-center">
          <p>Swipe or use buttons to move</p>
        </div>
      </div>
    </div>
  );

  // Add this to the game controls section where appropriate
  const handleDisconnect = () => {
    disconnectWallet();
    router.push("/"); // Redirect to home page after disconnecting
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="relative w-full max-w-[660px]">
        {/* Game Controls for medium and large screens */}
        <div className="hidden md:flex justify-between items-center mb-4 bg-gray-900 p-3 rounded-lg border border-gray-800 shadow-lg">
          <div className="flex items-center">
            <h2 className="text-2xl font-bold text-white">Space Puzzle</h2>
            <div className="ml-4 px-3 py-1 bg-gray-800 rounded-md text-gray-400 text-sm hidden lg:block">
              Use arrow keys to move
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleKeyDown({ key: "r" } as KeyboardEvent)}
              className="bg-gray-800 hover:bg-gray-700 text-[#F89213] px-4 py-2 rounded-lg flex items-center gap-2 border border-[#F89213] shadow-lg transition-colors"
              title="Press R key to restart"
            >
              <span className="font-medium">Restart</span>
              <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded">
                R
              </span>
            </button>
            <button
              onClick={() => handleKeyDown({ key: "p" } as KeyboardEvent)}
              className="bg-gray-800 hover:bg-gray-700 text-[#F89213] px-4 py-2 rounded-lg flex items-center gap-2 border border-[#F89213] shadow-lg transition-colors"
              title="Press P key to pause/resume"
            >
              <span className="font-medium">Pause</span>
              <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded">
                P
              </span>
            </button>
            <button
              onClick={handleQuitGame}
              className="bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 border border-red-700 shadow-lg transition-colors"
              title="Quit the game"
            >
              <span className="text-lg">✕</span>
              <span className="font-medium">Stop</span>
            </button>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={WINDOW_WIDTH}
          height={WINDOW_HEIGHT}
          className="w-full h-auto border border-gray-700 rounded-lg touch-none"
          style={{ maxHeight: "90vh", objectFit: "contain" }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        {gameOver && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center bg-black bg-opacity-75 p-6 rounded-lg">
            <h2 className="text-2xl text-white mb-4">Game Over!</h2>
            <p className="text-white mb-2">Final Score: {score}</p>
            <p className="text-white mb-4">Press R to Restart</p>
            <p className="text-white">Press ESC or swipe down to Quit</p>
          </div>
        )}
        {isPaused && !gameOver && !showQuitConfirm && !showSaveConfirm && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center bg-black bg-opacity-75 p-6 rounded-lg">
            <h2 className="text-2xl text-white mb-4">Paused</h2>
            <p className="text-white mb-2">Press P to Continue</p>
            <p className="text-white mb-2">Press R to Restart</p>
            <p className="text-white">Press ESC or swipe down to Quit</p>
          </div>
        )}

        {/* Quit Confirmation Dialog */}
        {showQuitConfirm && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 border-2 border-[#F89213] p-6 rounded-lg shadow-2xl w-[90%] max-w-md">
            <h2 className="text-2xl text-[#F89213] mb-4 text-center">
              Quit Game?
            </h2>
            <p className="text-white mb-6 text-center">
              Are you sure you want to quit the game? Your current progress will
              be lost.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={cancelQuit}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmQuit}
                className="bg-[#F89213] hover:bg-[#e07e0e] text-white px-6 py-2 rounded-lg transition-colors"
              >
                Quit
              </button>
            </div>
          </div>
        )}

        {/* Save Progress Dialog */}
        {showSaveConfirm && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 border-2 border-[#F89213] p-6 rounded-lg shadow-2xl w-[90%] max-w-md">
            <h2 className="text-2xl text-[#F89213] mb-4 text-center">
              Save Progress?
            </h2>
            <p className="text-white mb-4 text-center">
              Would you like to save your game progress to the blockchain?
            </p>
            <div className="bg-gray-800 p-3 rounded-lg mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Score:</span>
                <span className="text-white">{score}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Level:</span>
                <span className="text-white">{level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Keys:</span>
                <span className="text-white">{totalKeys}</span>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              {isSaving ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#F89213]"></div>
                  <span className="ml-2 text-white">Saving...</span>
                </div>
              ) : (
                <>
                  <button
                    onClick={quitWithoutSaving}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Don't Save
                  </button>
                  <button
                    onClick={cancelSave}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveGameProgress}
                    className="bg-[#F89213] hover:bg-[#e07e0e] text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Save
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <MobileControls />
    </div>
  );
}
