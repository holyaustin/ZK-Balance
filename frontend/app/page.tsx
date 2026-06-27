"use client";

import React, { useState } from "react";
// Import clear relative folder paths matching your project directory topology
import ConnectWallet from "../components/ConnectWallet";
import BalanceChecker from "../components/BalanceChecker";
import UseCases from "../components/UseCases"; // FIX: Imported the new component

export default function Home() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Clear application states to handle user sign out requests seamlessly
  const handleLogout = () => {
    setPublicKey(null);
    setIsVerified(null);
    setIsLoading(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("zk_connected_provider");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased flex flex-col pb-16">
      {/* Top Header Navigation Bar */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-40 w-full transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-primary tracking-tight">🔐 ZK</span>
              <span className="text-xl font-bold tracking-tight text-foreground">Balance</span>
            </div>

            {/* Dynamic Status Badges and Logout Trigger Layout Block */}
            {publicKey && (
              <div className="flex items-center gap-3 animate-fade-in">
                <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50/50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Connected: {publicKey.slice(0, 6)}...{publicKey.slice(-4)}
                </div>
                
                <button
                  onClick={handleLogout}
                  className="cursor-pointer rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-foreground transition-all duration-200 hover:bg-muted-bg hover:text-red-500 focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Dashboard Area */}
      <main className="flex-1 w-full mx-auto max-w-7xl px-4 py-12 sm:py-16 flex flex-col items-center">
        {/* Isolated max-w-md workspace layout column */}
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-3">
              ZK-Balance Checker
            </h1>
            <p className="text-muted font-medium text-sm sm:text-base">
              Prove you have enough funds without revealing your exact ledger balance
            </p>
          </div>

          {!publicKey ? (
            <div className="rounded-2xl bg-card p-6 border border-border shadow-xs">
              <ConnectWallet onConnect={setPublicKey} />
            </div>
          ) : (
            <div className="space-y-6 animate-scale-up">
              {/* Mobile Account Indicator Fallback visible when screens are narrow */}
              <div className="sm:hidden rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-3.5 text-center dark:border-emerald-900/30 dark:bg-emerald-950/20">
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                  ✅ Connected: {publicKey.slice(0, 6)}...{publicKey.slice(-4)}
                </p>
              </div>

              <div className="rounded-2xl bg-card p-6 border border-border shadow-md">
                <BalanceChecker
                  publicKey={publicKey}
                  onVerifyStart={() => setIsLoading(true)}
                  onVerifyComplete={(result) => {
                    setIsVerified(result);
                    setIsLoading(false);
                  }}
                />

                {isLoading && (
                  <div className="mt-6 flex flex-col items-center justify-center py-4 border-t border-border animate-pulse">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="mt-3 font-semibold text-sm text-muted text-center">Generating zero-knowledge math verification proof...</p>
                  </div>
                )}

                {isVerified !== null && !isLoading && (
                  <div className={`mt-6 rounded-xl p-5 text-center border ring-1 transition-all duration-300 ${
                    isVerified 
                      ? "bg-emerald-50/40 border-emerald-200/60 ring-emerald-100/30 dark:bg-emerald-950/10 dark:border-emerald-900/30" 
                      : "bg-rose-50/40 border-rose-200/60 ring-rose-100/30 dark:bg-rose-950/10 dark:border-rose-900/30"
                  }`}>
                    <div className="text-4xl mb-2 animate-bounce">{isVerified ? "🛡️" : "⚠️"}</div>
                    <h3 className={`text-lg font-extrabold tracking-tight ${
                      isVerified ? "text-emerald-800 dark:text-emerald-400" : "text-rose-800 dark:text-rose-400"
                    }`}>
                      {isVerified
                        ? "Proof Verified! Sufficient Balance Validated On-Chain."
                        : "Verification Failed. Target Threshold Math Rejected."}
                    </h3>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* USE CASE SECTION ACCESSIBLE TO CONNECTED AND UNCONNECTED USERS */}
        <div className="w-full border-t border-border/60 mt-16">
          <UseCases />
        </div>
      </main>
    </div>
  );
}
