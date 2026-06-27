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
  const [assetCode, setAssetCode] = useState("XLM"); 
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [showExactBalance, setShowExactBalance] = useState(false); // Default hidden for privacy
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = async () => {
    try {
      const server = new Horizon.Server('https://horizon-testnet.stellar.org');
      const account = await server.loadAccount(publicKey);
      
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
    setVerificationSuccess(false);
    onVerifyStart();
    setIsLoading(true);

    try {
      const balanceAmount = await fetchBalance();
      
      if (balanceAmount === 0) {
        throw new Error("Your account has no balance. Please fund it with testnet XLM first.");
      }

      const balanceInSmallest = Math.floor(balanceAmount * 10000000);
      const thresholdInSmallest = Math.floor(parseFloat(threshold) * 10000000);

      if (isNaN(thresholdInSmallest) || thresholdInSmallest <= 0) {
        throw new Error("Please input a valid minimum threshold balance.");
      }

      console.log(`🔍 Balance: ${balanceAmount} ${assetCode}`);
      console.log(`🔍 Threshold: ${threshold} ${assetCode}`);

      console.log('🔐 Generating proof...');
      const { proof, pubInputs } = await generateProof(
        balanceInSmallest,
        thresholdInSmallest
      );
      console.log('✅ Proof generated!');

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

      if (result) {
        setVerificationSuccess(true);
      }
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
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-gray-600">Account Balance Status:</span>
            <button
              type="button"
              onClick={() => setShowExactBalance(!showExactBalance)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 focus:outline-none flex items-center gap-1 cursor-pointer"
            >
              {showExactBalance ? (
                <>
                  <span>🙈 Hide Exact Value</span>
                </>
              ) : (
                <>
                  <span>👁️ Reveal Exact Value</span>
                </>
              )}
            </button>
          </div>
          
          <div className="mt-2 p-2 rounded-lg bg-white border border-gray-100 flex items-center justify-center min-h-[48px]">
            {showExactBalance ? (
              <span className="text-lg font-extrabold text-gray-900 tracking-tight transition-all animate-fade-in">
                {userBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} {assetCode}
              </span>
            ) : (
              <span className="text-lg font-bold text-gray-400 tracking-widest selection:bg-transparent select-none">
                •••••••••••• {assetCode}
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-1 text-center">
            Your exact balance is kept private. Only a zero-knowledge validity parameter is broadcasted on-chain.
          </p>
        </div>
      )}

      <button 
        onClick={handleVerify} 
        disabled={isLoading}
        className="w-full cursor-pointer rounded-xl bg-blue-600 px-4 py-3.5 text-base font-bold text-white transition-all duration-200 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        {isLoading ? 'Processing ZK Pipeline...' : 'Generate & Verify Proof'}
      </button>

      {/* ANIMATED SUCCESS BANNER CARD */}
      {verificationSuccess && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-5 shadow-sm space-y-2 animate-bounce-short">
          <div className="flex items-center gap-2.5 text-green-800">
            <span className="text-xl">🛡️</span>
            <h4 className="text-base font-bold tracking-tight">On-Chain Verification Successful</h4>
          </div>
          <p className="text-sm text-green-700 font-medium leading-relaxed">
            The Soroban smart contract has successfully processed your Groth16 cryptographic proof. Your wallet has been validated to hold at least <strong>{parseFloat(threshold).toLocaleString()} {assetCode}</strong> without exposing your exact financial statements or raw data metrics to the ledger!
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <p className="text-sm font-bold text-red-600 flex items-center gap-2">
            <span>⚠️</span> {error}
          </p>
        </div>
      )}
    </div>
  );
}
