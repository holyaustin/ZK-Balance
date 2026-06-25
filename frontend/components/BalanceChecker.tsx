'use client';

import { useState } from 'react';
// Fix 1: Adjusted imports from root layout path configuration rather than using '@/'
import { generateProof } from '../lib/proofGenerator';
import { verifyOnChain } from '../lib/verifier';
import { Horizon } from '@stellar/stellar-sdk';

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
    const [threshold, setThreshold] = useState('100');
    const [assetCode, setAssetCode] = useState('USDC');
    const [userBalance, setUserBalance] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchBalance = async () => {
        try {
            const server = new Horizon.Server('https://horizon-testnet.stellar.org');
            const account = await server.loadAccount(publicKey);
            
            // Fix 4: TypeScript discrimination check mapping to separate Native entries from Token assets cleanly
            const balance = account.balances.find((b) => {
                if (assetCode === 'XLM') {
                    return b.asset_type === 'native';
                }
                return 'asset_code' in b && b.asset_code === assetCode;
            });
            
            const balanceAmount = parseFloat(balance?.balance || '0');
            setUserBalance(balanceAmount);
            
            return balanceAmount;
        } catch (err) {
            setError('Failed to fetch balance');
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

            const { proof, pubInputs } = await generateProof(
                balanceInSmallest,
                thresholdInSmallest
            );

            const contractId = process.env.NEXT_PUBLIC_VERIFIER_CONTRACT_ID!;
            if (!contractId) {
                throw new Error('Missing contract identifier context configuration.');
            }

            const result = await verifyOnChain(
                proof,
                pubInputs,
                contractId,
                publicKey
            );

            onVerifyComplete(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Cryptographic proof pipeline failure');
            onVerifyComplete(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Tailwind v4 layout grid utilizing native border variations */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground/80">
                        Asset Code
                    </label>
                    <input
                        type="text"
                        value={assetCode}
                        onChange={(e) => setAssetCode(e.target.value.toUpperCase())}
                        className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground focus:border-primary/80 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                        placeholder="USDC"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground/80">
                        Minimum Balance
                    </label>
                    <input
                        type="number"
                        value={threshold}
                        onChange={(e) => setThreshold(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground focus:border-primary/80 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                        placeholder="100"
                        min="0"
                        step="1"
                    />
                </div>
            </div>

            {userBalance !== null && (
                <div className="rounded-xl border border-border bg-muted-bg p-4">
                    <p className="text-sm text-muted">
                        Current balance: <span className="font-bold text-foreground">{userBalance} {assetCode}</span>
                    </p>
                </div>
            )}

            <button
                onClick={handleVerify}
                className="w-full cursor-pointer rounded-xl bg-primary px-4 py-3.5 font-bold text-white transition-all duration-200 hover:bg-primary-hover focus:outline-hidden focus:ring-2 focus:ring-primary/50"
            >
                Generate & Verify Proof
            </button>

            {error && (
                <div className="rounded-xl border border-red-200/60 bg-red-50/50 p-4 dark:border-red-900/30 dark:bg-red-950/20">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}
        </div>
    );
}
