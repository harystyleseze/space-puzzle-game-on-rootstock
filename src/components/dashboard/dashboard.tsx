"use client";

import { useState, useEffect } from "react";
import useSound from "use-sound";
import { Award, Trophy, Rocket, Calendar, User } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

import PlayerStats from "./player-stats";
import Leaderboard from "./leaderboard";
import BadgeShowcase from "./badge-showcase";
import DailyRewards from "./daily-rewards";

// Mock data - would be replaced with actual contract calls
const mockPlayerData = {
  address: "0x1234...5678",
  points: 145,
  highScore: 230,
  lastClaimTime: Date.now() - 12 * 60 * 60 * 1000, // 12 hours ago
  badges: [
    { type: 1, name: "Bronze", earned: true },
    { type: 2, name: "Silver", earned: true },
    { type: 3, name: "Gold", earned: false },
  ],
};

const BADGE_THRESHOLDS = {
  BRONZE: 50,
  SILVER: 200,
  GOLD: 900,
};

export default function Dashboard() {
  const [playerData, setPlayerData] = useState(mockPlayerData);
  const [nextClaimTime, setNextClaimTime] = useState<Date | null>(null);
  const [canClaim, setCanClaim] = useState(false);
  const [playSuccess] = useSound("/sounds/success.mp3", { volume: 0.5 });
  const { toast } = useToast();

  // Calculate time until next claim
  useEffect(() => {
    const calculateNextClaim = () => {
      const lastClaim = new Date(playerData.lastClaimTime);
      const nextClaim = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000); // 24 hours cooldown
      setNextClaimTime(nextClaim);
      setCanClaim(Date.now() >= nextClaim.getTime());
    };

    calculateNextClaim();
    const timer = setInterval(calculateNextClaim, 1000);
    return () => clearInterval(timer);
  }, [playerData.lastClaimTime]);

  // Function to claim daily points - would call the contract
  const claimDailyPoints = () => {
    if (!canClaim) return;

    // Mock contract interaction
    setPlayerData((prev) => ({
      ...prev,
      points: prev.points + 10,
      lastClaimTime: Date.now(),
    }));

    playSuccess();
    toast({
      title: "Daily Points Claimed!",
      description: "You've received 10 points. Come back tomorrow for more!",
    });
  };

  // Calculate progress to next badge
  const calculateNextBadgeProgress = () => {
    if (playerData.highScore >= BADGE_THRESHOLDS.GOLD) return 100;
    if (playerData.highScore >= BADGE_THRESHOLDS.SILVER) {
      return (
        ((playerData.highScore - BADGE_THRESHOLDS.SILVER) /
          (BADGE_THRESHOLDS.GOLD - BADGE_THRESHOLDS.SILVER)) *
        100
      );
    }
    if (playerData.highScore >= BADGE_THRESHOLDS.BRONZE) {
      return (
        ((playerData.highScore - BADGE_THRESHOLDS.BRONZE) /
          (BADGE_THRESHOLDS.SILVER - BADGE_THRESHOLDS.BRONZE)) *
        100
      );
    }
    return (playerData.highScore / BADGE_THRESHOLDS.BRONZE) * 100;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Rocket className="h-8 w-8 text-[#F89213]" />
            <h1 className="text-2xl font-bold text-white">Space Puzzle</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-full">
              <Award className="h-5 w-5 text-[#F89213]" />
              <span className="text-white font-medium">
                {playerData.points} Points
              </span>
            </div>
            <Button className="bg-[#F89213] hover:bg-[#E07800] text-white">
              <Rocket className="mr-2 h-4 w-4" />
              Play Now
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-[#F89213]" />
                  Your Progress
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Keep playing to earn more badges and climb the leaderboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white">
                      High Score:{" "}
                      <span className="text-[#F89213] font-bold">
                        {playerData.highScore}
                      </span>
                    </span>
                    <span className="text-slate-400 text-sm">
                      {playerData.highScore >= BADGE_THRESHOLDS.GOLD
                        ? "Gold Badge Achieved!"
                        : playerData.highScore >= BADGE_THRESHOLDS.SILVER
                        ? `${
                            BADGE_THRESHOLDS.GOLD - playerData.highScore
                          } points to Gold`
                        : playerData.highScore >= BADGE_THRESHOLDS.BRONZE
                        ? `${
                            BADGE_THRESHOLDS.SILVER - playerData.highScore
                          } points to Silver`
                        : `${
                            BADGE_THRESHOLDS.BRONZE - playerData.highScore
                          } points to Bronze`}
                    </span>
                  </div>
                  <Progress
                    value={calculateNextBadgeProgress()}
                    className="h-2 bg-slate-700"
                  >
                    <div
                      className="h-full bg-gradient-to-r from-[#F89213] to-[#FFB347] rounded-full transition-all"
                      style={{ width: `${calculateNextBadgeProgress()}%` }}
                    />
                  </Progress>
                  <div className="flex justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <div className="relative w-6 h-6 overflow-hidden rounded-full">
                        <Image
                          src="/images/bronze explorer.jpg"
                          alt="Bronze Explorer"
                          fill
                          className={`object-cover ${
                            playerData.highScore >= BADGE_THRESHOLDS.BRONZE
                              ? ""
                              : "grayscale opacity-50"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs ${
                          playerData.highScore >= BADGE_THRESHOLDS.BRONZE
                            ? "text-[#CD7F32]"
                            : "text-slate-500"
                        }`}
                      >
                        Bronze
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative w-6 h-6 overflow-hidden rounded-full">
                        <Image
                          src="/images/silver navigator.jpg"
                          alt="Silver Navigator"
                          fill
                          className={`object-cover ${
                            playerData.highScore >= BADGE_THRESHOLDS.SILVER
                              ? ""
                              : "grayscale opacity-50"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs ${
                          playerData.highScore >= BADGE_THRESHOLDS.SILVER
                            ? "text-[#C0C0C0]"
                            : "text-slate-500"
                        }`}
                      >
                        Silver
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative w-6 h-6 overflow-hidden rounded-full">
                        <Image
                          src="/images/gold commander.jpg"
                          alt="Gold Commander"
                          fill
                          className={`object-cover ${
                            playerData.highScore >= BADGE_THRESHOLDS.GOLD
                              ? ""
                              : "grayscale opacity-50"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs ${
                          playerData.highScore >= BADGE_THRESHOLDS.GOLD
                            ? "text-[#FFD700]"
                            : "text-slate-500"
                        }`}
                      >
                        Gold
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="leaderboard" className="w-full">
              <TabsList className="grid grid-cols-2 bg-slate-800/50 border border-slate-700">
                <TabsTrigger
                  value="leaderboard"
                  className="data-[state=active]:bg-[#F89213] data-[state=active]:text-white"
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Leaderboard
                </TabsTrigger>
                <TabsTrigger
                  value="badges"
                  className="data-[state=active]:bg-[#F89213] data-[state=active]:text-white"
                >
                  <Award className="mr-2 h-4 w-4" />
                  Your Badges
                </TabsTrigger>
              </TabsList>
              <TabsContent value="leaderboard" className="mt-4">
                <Leaderboard
                  scores={[
                    { player: "0x1234...5678", score: 230 },
                    { player: "0xabcd...efgh", score: 180 },
                    { player: "0x9876...5432", score: 150 },
                  ]}
                  playerAddress={playerData.address}
                />
              </TabsContent>
              <TabsContent value="badges" className="mt-4">
                <BadgeShowcase
                  badges={playerData.badges
                    .filter((b) => b.earned)
                    .map((b) => ({
                      type: String(b.type),
                      score: b.type === 1 ? 50 : b.type === 2 ? 200 : 900,
                    }))}
                  playerPoints={playerData.points}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm shadow-xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#F89213]" />
                  Daily Rewards
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Claim your daily points to earn badges faster
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DailyRewards
                  canClaim={canClaim}
                  nextClaimTime={
                    nextClaimTime
                      ? nextClaimTime.getTime()
                      : Date.now() + 86400000
                  }
                  onClaim={claimDailyPoints}
                />
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-[#F89213]" />
                  Player Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PlayerStats
                  isLoading={false}
                  stats={{
                    address: playerData.address,
                    points: playerData.points,
                    keys: 0,
                    highScore: playerData.highScore,
                    currentLevel: 1,
                    highestLevel: 5,
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
