'use client';

import { useState } from 'react';

interface ConnectWalletProps {
    onConnect: (publicKey: string) => void;
}

export default function ConnectWallet({ onConnect }: ConnectWalletProps) {
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const connectWithFreighter = async () => {
        setIsConnecting(true);
        setError(null);

        try {
            // Step 1: Ensure freighter is globally accessible in the browser window context
            const isFreighterAvailable = typeof window !== 'undefined' && (window as any).freighter;

            if (!isFreighterAvailable) {
                if (typeof window !== 'undefined') {
                    window.open('https://freighter.app', '_blank');
                }
                throw new Error('Freighter wallet extension not detected. Redirecting to download page...');
            }

            // Step 2: Retrieve the active public key from the global freighter interface injection
            const result = await (window as any).freighter.getPublicKey();
            
            if (!result || typeof result !== 'string') {
                throw new Error('Connection rejected or no account profile found in your extension.');
            }

            onConnect(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to connect wallet via extension interface');
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <div className="space-y-4">
            <button
                onClick={connectWithFreighter}
                disabled={isConnecting}
                className="w-full cursor-pointer rounded-xl bg-primary px-4 py-3.5 font-semibold text-white transition-all duration-200 hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-muted/40 disabled:text-muted focus:outline-hidden focus:ring-2 focus:ring-primary/50"
            >
                {isConnecting ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Awaiting Wallet Approval...</span>
                    </div>
                ) : (
                    'Connect via Freighter'
                )}
            </button>
            
            {error && (
                <div className="rounded-xl border border-red-200/60 bg-red-50/50 p-4 dark:border-red-900/30 dark:bg-red-950/20">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}
        </div>
    );
}
