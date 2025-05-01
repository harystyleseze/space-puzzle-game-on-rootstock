"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useWeb3 } from "@/contexts/Web3Context";

export default function HomePage() {
  const { isConnected, connectWallet, disconnectWallet } = useWeb3();

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-[#F89213]">
            Space Puzzle Game
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Navigate through space, collect keys, and solve puzzles to earn
            rewards on the blockchain.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {!isConnected ? (
              <button
                onClick={connectWallet}
                className="bg-[#F89213] hover:bg-[#e07e0e] text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
              >
                Connect Wallet
              </button>
            ) : (
              <>
                <Link
                  href="/game"
                  className="bg-[#F89213] hover:bg-[#e07e0e] text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
                >
                  Play Now
                </Link>
                <button
                  onClick={disconnectWallet}
                  className="bg-gray-700 hover:bg-gray-600 border border-[#F89213] text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
                >
                  Disconnect Wallet
                </button>
              </>
            )}
            <Link
              href="/achievements"
              className="bg-gray-700 hover:bg-gray-600 border border-[#F89213] text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
            >
              View Achievements
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 bg-gray-800 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-[#F89213]">
            Game Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-700 p-6 rounded-lg border-t-4 border-[#F89213]">
              <h3 className="text-xl font-bold mb-4 text-[#F89213]">
                Strategic Gameplay
              </h3>
              <p>
                Navigate through challenging levels, avoid obstacles, and
                collect keys to unlock portals.
              </p>
            </div>
            <div className="bg-gray-700 p-6 rounded-lg border-t-4 border-[#F89213]">
              <h3 className="text-xl font-bold mb-4 text-[#F89213]">
                Blockchain Rewards
              </h3>
              <p>
                Earn points and convert keys to unlock NFT badges that showcase
                your achievements.
              </p>
            </div>
            <div className="bg-gray-700 p-6 rounded-lg border-t-4 border-[#F89213]">
              <h3 className="text-xl font-bold mb-4 text-[#F89213]">
                Competitive Leaderboard
              </h3>
              <p>
                Compete with other players to reach the top of the global
                leaderboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Play Section */}
      <section className="w-full py-12 md:py-24 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-[#F89213]">
            How to Play
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2 text-[#F89213]">
                  1. Connect Your Wallet
                </h3>
                <p>
                  Start by connecting your MetaMask wallet to track your
                  progress and earn rewards.
                </p>
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2 text-[#F89213]">
                  2. Navigate the Grid
                </h3>
                <p>
                  Use arrow keys or swipe gestures to move your spaceship
                  through the grid.
                </p>
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2 text-[#F89213]">
                  3. Collect Keys
                </h3>
                <p>
                  Gather all keys in each level to activate the portal and
                  advance.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-[#F89213]">
                  4. Earn Rewards
                </h3>
                <p>
                  Convert your keys to points and claim daily points to earn NFT
                  badges.
                </p>
              </div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-[#F89213] border-opacity-30">
              <div className="rounded-lg overflow-hidden bg-gray-700 p-4 flex items-center justify-center">
                <div className="relative w-full max-w-md mx-auto">
                  <Image
                    src="/images/play.jpg"
                    alt="Space Puzzle Game"
                    width={600}
                    height={400}
                    className="rounded-lg shadow-lg"
                    style={{ objectFit: "cover" }}
                  />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Image
                      src="/images/spaceship.png"
                      alt="Spaceship"
                      width={80}
                      height={80}
                      className="animate-pulse"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-12">
            <Link
              href="/game"
              className="bg-[#F89213] hover:bg-[#e07e0e] text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
            >
              Start Playing Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
