"use client";

import React, { useState } from "react";
import { horizonServer } from "@/lib/stellar";
import { verifyOnChain } from "@/lib/verifier";
import Button from "./Button";
import Input from "./Input";

interface BalanceCheckerProps {
  publicKey: string;
  onVerifyStart: () => void;
  onVerifyComplete: (result: boolean) => void;
}

export default function BalanceChecker({
  publicKey,
  onVerifyStart,
  onVerifyComplete,
}: BalanceCheckerProps) {
  const [threshold, setThreshold] = useState("100");
  const [assetCode, setAssetCode] = useState("USDC");
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    try {
      const account = await horizonServer.loadAccount(publicKey);
      const balance = account.balances.find(
        (b) => b.asset_type === "credit_alphanum4" && b.asset_code === assetCode
      );
      const balanceAmount = parseFloat(balance?.balance || "0");
      setUserBalance(balanceAmount);
      return balanceAmount;
    } catch (err) {
      setError("Failed to fetch balance");
      return 0;
    }
  };

  const handleVerify = async () => {
    setError(null);
    onVerifyStart();

    try {
      const balanceAmount = await fetchBalance();
      const balanceInSmallest = Math.floor(balanceAmount * 10000000);
      const thresholdInSmallest = Math.floor(parseFloat(threshold) * 10000000);

      // Generate ZK proof (you'll implement this using snarkjs)
      const { proof, pubInputs } = await generateProof(
        balanceInSmallest,
        thresholdInSmallest
      );

      const contractId = process.env.NEXT_PUBLIC_VERIFIER_CONTRACT_ID!;
      const result = await verifyOnChain(
        proof,
        pubInputs,
        contractId,
        publicKey
      );

      onVerifyComplete(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      onVerifyComplete(false);
    }
  };

  // Placeholder for proof generation
  const generateProof = async (balance: number, threshold: number) => {
    // You'll implement this using snarkjs
    // For now, return mock data
    return {
      proof: {
        a: "0x1234",
        b: "0x5678",
        c: "0x9abc",
      },
      pubInputs: [threshold.toString(), "1"],
    };
  };

  return (
    <div className="space-y-6">
      <Input
        type="text"
        placeholder="USDC"
        value={assetCode}
        onChange={(e) => setAssetCode(e.target.value.toUpperCase())}
        label="Asset Code"
      />

      <Input
        type="number"
        placeholder="100"
        value={threshold}
        onChange={(e) => setThreshold(e.target.value)}
        label="Minimum Balance"
        required
      />

      {userBalance !== null && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-blue-700 text-sm">
            Current balance: <span className="font-semibold">{userBalance} {assetCode}</span>
          </p>
        </div>
      )}

      <Button onClick={handleVerify} className="w-full bg-green-500 hover:bg-green-700">
        Generate & Verify Proof
      </Button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}