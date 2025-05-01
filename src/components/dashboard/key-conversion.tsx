"use client";

import React, { useState } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { Key, Coins, Award } from "lucide-react";

export default function KeyConversion() {
  const { playerStats, convertKeysToPoints } = useWeb3();
  const [isConverting, setIsConverting] = useState(false);
  const [conversionAmount, setConversionAmount] = useState(50);
  const [error, setError] = useState<string | null>(null);

  // Get keys as a safe number
  const availableKeys = playerStats?.keys || 0;

  const handleConvert = async () => {
    if (!playerStats || availableKeys < conversionAmount) {
      setError("Not enough keys to convert");
      return;
    }

    if (conversionAmount % 50 !== 0) {
      setError("Amount must be a multiple of 50");
      return;
    }

    try {
      setIsConverting(true);
      setError(null);
      await convertKeysToPoints(conversionAmount);
    } catch (err: any) {
      setError(err.message || "Failed to convert keys");
      console.error("Error converting keys:", err);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Convert Keys to Points</h2>

      <div className="bg-gray-700 p-4 rounded-lg mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 flex items-center">
            <Key className="w-4 h-4 mr-1" />
            Keys Available
          </span>
          <span className="text-green-400 font-bold">{availableKeys}</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-400 flex items-center">
            <Coins className="w-4 h-4 mr-1" />
            Conversion Rate
          </span>
          <span className="text-yellow-400 font-bold">50 Keys = 10 Points</span>
        </div>

        <div className="mb-4">
          <label
            htmlFor="conversionAmount"
            className="block text-gray-400 mb-1 text-sm"
          >
            Amount to Convert (multiple of 50)
          </label>
          <div className="flex gap-2">
            <input
              id="conversionAmount"
              type="number"
              min="50"
              step="50"
              value={conversionAmount}
              onChange={(e) => setConversionAmount(Number(e.target.value))}
              className="bg-gray-900 text-white px-3 py-2 rounded-lg w-full"
            />
            <button
              onClick={() =>
                setConversionAmount(
                  Math.max(50, availableKeys - (availableKeys % 50))
                )
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-lg text-sm"
            >
              Max
            </button>
          </div>
        </div>

        {error && <div className="text-red-400 text-sm mb-4">{error}</div>}

        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400">You will receive</span>
          <span className="text-yellow-400 font-bold">
            {Math.floor(conversionAmount / 50) * 10} Points
          </span>
        </div>
      </div>

      <button
        onClick={handleConvert}
        disabled={
          isConverting ||
          !playerStats ||
          availableKeys < conversionAmount ||
          conversionAmount < 50
        }
        className={`w-full font-bold py-2 px-4 rounded transition-colors flex items-center justify-center ${
          isConverting ||
          !playerStats ||
          availableKeys < conversionAmount ||
          conversionAmount < 50
            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
            : "bg-yellow-600 hover:bg-yellow-700 text-white"
        }`}
      >
        {isConverting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
            Converting...
          </>
        ) : (
          <>Convert Keys to Points</>
        )}
      </button>

      <div className="mt-4 text-sm text-gray-400">
        <p className="flex items-center">
          <Award className="w-4 h-4 mr-1" />
          Earn badges by accumulating points:
        </p>
        <ul className="list-disc list-inside mt-1 ml-5">
          <li>Bronze Explorer: 50 points</li>
          <li>Silver Navigator: 200 points</li>
          <li>Gold Commander: 900 points</li>
        </ul>
      </div>
    </div>
  );
}
