"use client";

import React from "react";

interface UseCaseItem {
  icon: string;
  title: string;
  description: string;
}

export default function UseCases() {
  const cases: UseCaseItem[] = [
    {
      icon: "💰",
      title: "Proof of Funds",
      description: "Prove sufficient funds for a transaction without revealing your exact balance or transaction history.",
    },
    {
      icon: "📝",
      title: "KYC / Compliance",
      description: "Demonstrate financial eligibility or accreditation status to vendors without exposing sensitive personal financial statements.",
    },
    {
      icon: "⛓️",
      title: "Private DeFi",
      description: "Interact with privacy-preserving decentralized finance protocols using zero-knowledge verified solvency proofs.",
    },
    {
      icon: "🎁",
      title: "Airdrop Eligibility",
      description: "Verify that your Web3 wallet matches explicit protocol structural baseline parameters anonymously.",
    },
    {
      icon: "🔑",
      title: "Rental Deposits",
      description: "Generate a cryptographically tamper-proof receipt showing you hold a security deposit threshold value.",
    },
    // FIX: Added the 6th use case to achieve a perfectly symmetrical grid layout
    {
      icon: "🏢",
      title: "Corporate Solvency",
      description: "Prove corporate liquidity or treasury health to lenders and regulators without leaking sensitive operational cash flows.",
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mt-16 px-4 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Real-World Use Cases
        </h2>
        <p className="text-muted font-medium text-sm mt-2 max-w-lg mx-auto">
          Explore how zero-knowledge cryptography alters private balance checks across financial architectures.
        </p>
      </div>

      {/* FIX: Set a balanced md:grid-cols-2 lg:grid-cols-3 pattern for an even 6-item grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cases.map((uc, i) => (
          <div
            key={i}
            className="group relative rounded-2xl bg-card p-5 border border-border shadow-xs hover:shadow-md hover:border-primary/30 transition-all duration-300 flex flex-col gap-3"
          >
            <div className="h-10 w-10 rounded-xl bg-muted-bg border border-border flex items-center justify-center text-lg group-hover:scale-110 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-300">
              {uc.icon}
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-base text-foreground tracking-tight">
                {uc.title}
              </h4>
              <p className="text-muted text-xs font-medium leading-relaxed">
                {uc.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
