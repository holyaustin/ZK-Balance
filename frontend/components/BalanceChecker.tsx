"use client";

import React, { useState } from "react";
import { verifyOnChain } from "../lib/verifier";
import { generateProof } from "../lib/proofGenerator";
import { Horizon } from "@stellar/stellar-sdk";

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
  const [assetCode, setAssetCode] = useState("XLM"); // Default to XLM for easier testing
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = async () => {
    try {
      // Use correct Testnet Horizon URL
      const server = new Horizon.Server('https://horizon-testnet.stellar.org');
      const account = await server.loadAccount(publicKey);
      
      // Find the balance for the specified asset
      const balance = account.balances.find((b) => {
        if (assetCode === "XLM") {
          return b.asset_type === "native";
        }
        return "asset_code" in b && b.asset_code === assetCode;
      });
      
      const balanceAmount = parseFloat(balance?.balance || "0");
      setUserBalance(balanceAmount);
      return balanceAmount;
    } catch (err) {
      console.error('Balance fetch error:', err);
      
      // Check if account doesn't exist
      if (err instanceof Error && err.message.includes('404')) {
        setError(`Account not found on Testnet. Please fund it using the friendbot.`);
      } else {
        setError("Failed to fetch balance from the Stellar Testnet ledger.");
      }
      return 0;
    }
  };

  const handleVerify = async () => {
    setError(null);
    onVerifyStart();
    setIsLoading(true);

    try {
      // First, ensure we have a balance
      const balanceAmount = await fetchBalance();
      
      if (balanceAmount === 0) {
        throw new Error("Your account has no balance. Please fund it with testnet XLM first.");
      }

      // Convert quantities using the standard 7-decimal place precision
      const balanceInSmallest = Math.floor(balanceAmount * 10000000);
      const thresholdInSmallest = Math.floor(parseFloat(threshold) * 10000000);

      if (isNaN(thresholdInSmallest) || thresholdInSmallest <= 0) {
        throw new Error("Please input a valid minimum threshold balance.");
      }

      console.log(`🔍 Balance: ${balanceAmount} ${assetCode}`);
      console.log(`🔍 Threshold: ${threshold} ${assetCode}`);

      // Generate the ZK proof
      console.log('🔐 Generating proof...');
      const { proof, pubInputs } = await generateProof(
        balanceInSmallest,
        thresholdInSmallest
      );
      console.log('✅ Proof generated!');

      // Verify on-chain
      const contractId = process.env.NEXT_PUBLIC_VERIFIER_CONTRACT_ID!;
      if (!contractId) {
        throw new Error("Missing NEXT_PUBLIC_VERIFIER_CONTRACT_ID environment variable.");
      }

      const result = await verifyOnChain(
        proof,
        pubInputs,
        contractId,
        publicKey
      );

      onVerifyComplete(result);
    } catch (err) {
      console.error('Verification error:', err);
      setError(err instanceof Error ? err.message : "Verification pipeline failed.");
      onVerifyComplete(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-bold tracking-tight text-gray-700 block">
            Asset Code
          </label>
          <input
            type="text"
            placeholder="XLM or USDC"
            value={assetCode}
            onChange={(e) => setAssetCode(e.target.value.toUpperCase())}
            className="w-full text-base font-medium rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <p className="text-xs text-gray-500">Use XLM for testing, or USDC if you have it</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold tracking-tight text-gray-700 block">
            Minimum Balance
          </label>
          <input
            type="number"
            placeholder="100"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            min="0"
            step="any"
            required
            className="w-full text-base font-medium rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      {userBalance !== null && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-600 flex items-center justify-between gap-2">
            <span>Current Balance:</span>
            <span className="text-base font-extrabold text-gray-900">
              {userBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} {assetCode}
            </span>
          </p>
        </div>
      )}

      <button 
        onClick={handleVerify} 
        disabled={isLoading}
        className="w-full cursor-pointer rounded-xl bg-blue-600 px-4 py-3.5 text-base font-bold text-white transition-all duration-200 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : 'Generate & Verify Proof'}
      </button>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-bold text-red-600">
            ⚠️ {error}
          </p>
        </div>
      )}
    </div>
  );
}