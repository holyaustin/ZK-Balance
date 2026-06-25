"use client";

import React, { useState, useEffect } from "react";
import { isConnected, setAllowed, getAddress } from "@stellar/freighter-api";
import Button from "./Button";

interface ConnectWalletProps {
  onConnect: (publicKey: string) => void;
}

export default function ConnectWallet({ onConnect }: ConnectWalletProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const providers = [
    { id: "freighter", name: "Freighter Wallet", icon: "🚀" },
    { id: "xbull", name: "xBull Wallet", icon: "🐂" },
    { id: "albedo", name: "Albedo Link", icon: "🛡️" },
  ];

  const connectWalletProvider = async (walletId: string) => {
    if (!isClient) return;

    setIsConnecting(walletId);
    setError(null);

    try {
      let publicKey = "";

      if (walletId === "freighter") {
        // Step 1: Check if Freighter is installed
        const isFreighterInstalled = await isConnected();
        if (!isFreighterInstalled) {
          window.open("https://freighter.app", "_blank");
          throw new Error(
            "Freighter extension not found! Please install it from https://freighter.app"
          );
        }

        // Step 2: Request connection
        await setAllowed();

        // Step 3: Get the public key
        const address = await getAddress();
        publicKey = address.address;

        if (!publicKey) {
          throw new Error("No account found. Please ensure Freighter is unlocked.");
        }
      } else if (walletId === "xbull") {
        // xBull connection logic
        const xBull = (window as any).xBull;
        if (!xBull) {
          window.open("https://xbull.app", "_blank");
          throw new Error("xBull extension not found!");
        }
        const accounts = await xBull.getPublicKey();
        publicKey = typeof accounts === "string" ? accounts : accounts[0];
      } else if (walletId === "albedo") {
        const albedo = (window as any).albedo;
        if (!albedo) {
          window.open("https://albedo.link", "_blank");
          throw new Error("Albedo not found!");
        }
        const session = await albedo.publicKey({});
        publicKey = session.pubkey;
      }

      if (!publicKey) {
        throw new Error("Connection request dismissed by the user.");
      }

      localStorage.setItem("zk_connected_provider", walletId);
      onConnect(publicKey);
      setIsOpen(false);
    } catch (err) {
      console.error("Wallet connection error:", err);
      setError(err instanceof Error ? err.message : "Wallet authorization failure.");
    } finally {
      setIsConnecting(null);
    }
  };

  if (!isClient) {
    return (
      <div className="w-full">
        <button
          disabled
          className="w-full bg-gray-400 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed"
        >
          Loading wallet...
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Button onClick={() => setIsOpen(true)} className="w-full">
        Connect Stellar Wallet
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
              <h3 className="text-lg font-bold text-gray-900">Select a Wallet</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => connectWalletProvider(provider.id)}
                  disabled={isConnecting !== null}
                  className="flex w-full items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-3.5 transition-all duration-200 hover:border-blue-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-left group"
                >
                  <span className="text-2xl transition-transform duration-200 group-hover:scale-110">
                    {provider.icon}
                  </span>
                  <span className="font-semibold text-gray-900 flex-1 group-hover:text-blue-600">
                    {provider.name}
                  </span>
                  {isConnecting === provider.id && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-6 text-center text-xs text-gray-500">
              <p>
                Don't have a wallet?{" "}
                <a
                  href="https://freighter.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Get started with Freighter
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}