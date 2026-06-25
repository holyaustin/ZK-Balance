'use client';

import { useState } from 'react';
// Fix 1: Removed '@/' prefix since you configured a direct root 'app' layout without a 'src/' dir
import ConnectWallet from '../components/ConnectWallet';
import BalanceChecker from '../components/BalanceChecker';
import ResultDisplay from '../components/ResultDisplay';

export default function Home() {
    const [publicKey, setPublicKey] = useState<string | null>(null);
    const [isVerified, setIsVerified] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    return (
        // Fix 2: Upgraded utility formatting to use native Tailwind v4 spacing syntax
        <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
                <div className="mb-12 text-center">
                    <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900">
                        🔐 ZK-Balance
                    </h1>
                    <p className="text-xl text-slate-600">
                        Prove you have enough funds without revealing your balance
                    </p>
                </div>

                {/* Tailwind v4 optimized shadows and modern rounded layouts */}
                <div className="space-y-8 rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200/50">
                    <ConnectWallet onConnect={setPublicKey} />
                    
                    {publicKey && (
                        <>
                            {/* Modernized notification badge with v4 slash opacity syntax */}
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                                <p className="font-medium text-emerald-800">
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
                                <div className="flex flex-col items-center justify-center py-6">
                                    {/* Tailwind v4 animation rule matching the clean layout design */}
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                                    <p className="mt-3 font-medium text-slate-600">Generating and verifying proof...</p>
                                </div>
                            )}
                            
                            {isVerified !== null && !isLoading && (
                                <ResultDisplay isVerified={isVerified} />
                            )}
                        </>
                    )}
                </div>

                <div className="mt-8 text-center text-sm text-slate-500">
                    <p>
                        Your balance is never shared. Only a proof is generated and verified on-chain.
                    </p>
                </div>
            </div>
        </main>
    );
}
