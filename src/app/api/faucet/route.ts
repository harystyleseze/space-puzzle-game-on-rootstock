import { NextResponse } from "next/server";
import { NETWORKS } from "@/utils/networkUtils";

// Faucet API endpoint for Core Testnet
export async function POST(request: Request) {
  try {
    // Parse the request body
    const { address, chainId } = await request.json();

    // Validate address
    if (!address || typeof address !== "string" || !address.startsWith("0x")) {
      return NextResponse.json(
        { message: "Invalid wallet address" },
        { status: 400 }
      );
    }

    // Ensure we're on testnet
    if (chainId !== NETWORKS.CORE_TESTNET.chainId) {
      return NextResponse.json(
        { message: "Faucet is only available on Core Testnet" },
        { status: 400 }
      );
    }

    // Make the request to the Core Testnet faucet
    const response = await fetch(
      "https://scan.test2.btcs.network/api/chain/faucet",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "bearer _p0eWHWyiCZjNSa8TdHPNIRkp3s",
        },
        body: JSON.stringify({ address }),
      }
    );

    // Parse the faucet response
    const data = await response.json();

    // Handle faucet response
    if (!response.ok) {
      console.error("Faucet API error:", data);
      return NextResponse.json(
        {
          message: data.message || "Failed to request tokens from faucet",
          error: data,
        },
        { status: response.status }
      );
    }

    // Return success response
    return NextResponse.json({
      message: "Testnet tokens requested successfully",
      data,
    });
  } catch (error: any) {
    console.error("Faucet request error:", error);
    return NextResponse.json(
      { message: "Failed to process faucet request", error: error.message },
      { status: 500 }
    );
  }
}
