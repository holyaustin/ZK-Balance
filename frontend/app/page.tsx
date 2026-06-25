"use client";

import React, { useState } from "react";
import ConnectWallet from "@/components/ConnectWallet";
import BalanceChecker from "@/components/BalanceChecker";

export default function Home() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">🔐 ZK-Balance</h1>
      <p className="text-gray-600 text-center mb-8">
        Prove you have enough funds without revealing your balance
      </p>

      {!publicKey ? (
        <ConnectWallet onConnect={setPublicKey} />
      ) : (
        <>
          <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-6">
            <p className="text-green-700 text-sm">
              ✅ Connected: {publicKey.slice(0, 6)}...{publicKey.slice(-4)}
            </p>
          </div>

          <BalanceChecker
            publicKey={publicKey}
            onVerifyStart={() => setIsLoading(true)}
            onVerifyComplete={(result) => {
              setIsVerified(result);
              setIsLoading(false);
            }}
          />

          {isLoading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Generating and verifying proof...</p>
            </div>
          )}

          {isVerified !== null && !isLoading && (
            <div className={`rounded-lg p-6 text-center mt-6 ${
              isVerified ? "bg-green-50 border-green-200 border" : "bg-red-50 border-red-200 border"
            }`}>
              <div className="text-4xl mb-2">{isVerified ? "✅" : "❌"}</div>
              <h3 className={`text-xl font-semibold ${
                isVerified ? "text-green-800" : "text-red-800"
              }`}>
                {isVerified
                  ? "Proof Verified! You have sufficient balance."
                  : "Verification Failed. You may not have enough balance."}
              </h3>
            </div>
          )}
        </>
      )}
    </div>
  );
}