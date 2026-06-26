'use client';

import React, { useState, useEffect } from 'react';
import { isConnected, setAllowed, getAddress } from '@stellar/freighter-api';

interface ConnectWalletProps {
    onConnect: (publicKey: string) => void;
}

export default function ConnectWallet({ onConnect }: ConnectWalletProps) {
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    // Safeguard to prevent Next.js Hydration Mismatch issues on SSR build steps
    useEffect(() => {
        setIsClient(true);
    }, []);

    const connectFreighterWallet = async () => {
        if (!isClient) return;
        
        setIsConnecting(true);
        setError(null);

        try {
            // Step 1: Verify Freighter is active in the browser environment
            const connected = await isConnected();
            if (!connected) {
                window.open('https://freighter.app', '_blank');
                throw new Error('Freighter extension not found! Please install it from https://freighter.app');
            }

            // Step 2: Request access permission from the extension
            await setAllowed();

            // Step 3: Fetch the active public cryptographic key account string
            const addressData = await getAddress();
            const publicKey = addressData?.address || '';

            if (!publicKey) {
                throw new Error('No account found. Please ensure your Freighter wallet is unlocked.');
            }

            // Store successful provider selection context profile for lib/verifier calls
            localStorage.setItem('zk_connected_provider', 'freighter');
            onConnect(publicKey);
        } catch (err) {
            console.error('Freighter link error:', err);
            setError(err instanceof Error ? err.message : 'Wallet authorization failure.');
        } finally {
            setIsConnecting(false);
        }
    };

    if (!isClient) {
        return (
            <div className="w-full">
                <button
                    disabled
                    className="w-full bg-slate-200 text-slate-400 font-semibold py-3.5 px-4 rounded-xl opacity-50 cursor-not-allowed text-center text-sm"
                >
                    Loading Freighter configuration...
                </button>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">
            {/* Direct Multi-wallet bypass: Single clear click action handler */}
            <button
                onClick={connectFreighterWallet}
                disabled={isConnecting}
                className="w-full cursor-pointer rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white transition-all duration-200 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xs"
            >
                {isConnecting ? (
                    <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Connecting Freighter...</span>
                    </>
                ) : (
                    <>
                        <span>🚀</span>
                        <span>Connect Freighter Wallet</span>
                    </>
                )}
            </button>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 animate-fade-in">
                    <p className="text-sm font-medium text-red-600">{error}</p>
                </div>
            )}
        </div>
    );
}
