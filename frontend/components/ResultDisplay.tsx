'use client';

interface ResultDisplayProps {
    isVerified: boolean;
}

export default function ResultDisplay({ isVerified }: ResultDisplayProps) {
    return (
        <div className={`rounded-2xl p-6 text-center border ring-1 transition-all duration-300 ${
            isVerified 
                ? 'bg-emerald-50/40 border-emerald-200/60 ring-emerald-100/30 dark:bg-emerald-950/10 dark:border-emerald-900/30' 
                : 'bg-rose-50/40 border-rose-200/60 ring-rose-100/30 dark:bg-rose-950/10 dark:border-rose-900/30'
        }`}>
            <div className="text-5xl mb-3 animate-bounce duration-1000">
                {isVerified ? '🛡️' : '⚠️'}
            </div>
            
            <h3 className={`text-xl font-extrabold tracking-tight ${
                isVerified ? 'text-emerald-800 dark:text-emerald-400' : 'text-rose-800 dark:text-rose-400'
            }`}>
                {isVerified 
                    ? 'Proof Verified Successfully!' 
                    : 'On-Chain Verification Failure'}
            </h3>
            
            <p className={`mt-2 text-sm font-medium ${
                isVerified ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'
            }`}>
                {isVerified 
                    ? 'On-chain verifier confirms your holdings satisfy the requested parameters.' 
                    : 'The smart contract rejected the signature or the threshold requirement math.'}
            </p>
        </div>
    );
}
