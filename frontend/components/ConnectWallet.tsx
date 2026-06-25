'use client';

import { useState } from 'react';

interface ConnectWalletProps {
    onConnect: (publicKey: string) => void;
}

export default function ConnectWallet({ onConnect }: ConnectWalletProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isConnecting, setIsConnecting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const wallets = [
        { id: 'freighter', name: 'Freighter Wallet', icon: '🚀' },
        { id: 'xbull', name: 'xBull Wallet', icon: '🐂' },
        { id: 'albedo', name: 'Albedo Link', icon: '🛡️' }
    ];

    const connectWalletProvider = async (walletId: string) => {
        setIsConnecting(walletId);
        setError(null);

        try {
            if (typeof window === 'undefined') return;
            const targetWindow = window as any;
            let publicKey = '';

            if (walletId === 'freighter') {
                // Check standard window injection properties safely
                const freighterAPI = targetWindow.starlight?.freighter || targetWindow.freighter;
                
                if (!freighterAPI) {
                    throw new Error('Freighter extension not detected! Please ensure the extension is active, unlocked, and has "Site Access" permissions enabled for localhost in your browser toolbar.');
                }
                publicKey = await freighterAPI.getPublicKey();
                
            } else if (walletId === 'xbull') {
                if (!targetWindow.xBull) {
                    throw new Error('xBull extension not found! Ensure it is active.');
                }
                const accounts = await targetWindow.xBull.getPublicKey();
                publicKey = typeof accounts === 'string' ? accounts : accounts;
                
            } else if (walletId === 'albedo') {
                if (!targetWindow.albedo) {
                    throw new Error('Albedo authentication helper not found.');
                }
                const session = await targetWindow.albedo.publicKey({});
                publicKey = session.pubkey;
            }

            if (!publicKey) {
                throw new Error('Connection request dismissed by the user.');
            }

            // Save active selection context to route subsequent transaction signatures correctly
            localStorage.setItem('zk_connected_provider', walletId);
            onConnect(publicKey);
            setIsOpen(false);
            
        } catch (err) {
            console.error('Wallet link trace failure:', err);
            setError(err instanceof Error ? err.message : 'Wallet authorization failure.');
        } finally {
            setIsConnecting(null);
        }
    };

    return (
        <div className="w-full">
            <button
                onClick={() => setIsOpen(true)}
                className="w-full cursor-pointer rounded-xl bg-primary px-4 py-3.5 font-semibold text-white transition-all duration-200 hover:bg-primary-hover focus:outline-hidden focus:ring-2 focus:ring-primary/50"
            >
                Connect Stellar Wallet
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl ring-1 ring-border border border-border">
                        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                            <h3 className="text-lg font-bold text-foreground">Select a Wallet</h3>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="text-muted hover:text-foreground cursor-pointer text-xl font-bold p-1"
                            >
                                ✕
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-xl border border-red-200/60 bg-red-50/50 p-3 dark:border-red-900/30 dark:bg-red-950/20">
                                <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            {wallets.map((provider) => (
                                <button
                                    key={provider.id}
                                    onClick={() => connectWalletProvider(provider.id)}
                                    disabled={isConnecting !== null}
                                    className="flex w-full cursor-pointer items-center gap-4 rounded-xl border border-border bg-muted-bg/30 p-3.5 transition-all duration-200 hover:border-primary/50 hover:bg-muted-bg disabled:opacity-50 disabled:cursor-not-allowed text-left group"
                                >
                                    <span className="text-2xl transition-transform duration-200 group-hover:scale-110">
                                        {provider.icon}
                                    </span>
                                    <span className="font-semibold text-foreground flex-1 group-hover:text-primary">
                                        {provider.name}
                                    </span>
                                    {isConnecting === provider.id && (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
