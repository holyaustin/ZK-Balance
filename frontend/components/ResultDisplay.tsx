'use client';

interface ResultDisplayProps {
    isVerified: boolean;
}

export default function ResultDisplay({ isVerified }: ResultDisplayProps) {
    return (
        <div className={`w-full rounded-2xl p-6 text-center border transition-all duration-300 ${
            isVerified 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:bg-emerald-500/5 dark:border-emerald-500/20' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:bg-rose-500/5 dark:border-rose-500/20'
        }`}>
            {/* Visual semantic anchor icon with subtle styling animation loops */}
            <div className="text-5xl mb-4 select-none animate-bounce" style={{ animationDuration: '2s' }}>
                {isVerified ? '🛡️' : '⚠️'}
            </div>
            
            <h3 className={`text-xl font-extrabold tracking-tight ${
                isVerified ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
            }`}>
                {isVerified 
                    ? 'Proof Verified Successfully!' 
                    : 'On-Chain Verification Failure'}
            </h3>
            
            <p className={`mt-2 text-sm font-semibold leading-relaxed max-w-xs mx-auto ${
                isVerified ? 'text-emerald-600/90 dark:text-emerald-400/80' : 'text-rose-600/90 dark:text-rose-400/80'
            }`}>
                {isVerified 
                    ? 'On-chain verifier confirms your holdings satisfy the requested parameters.' 
                    : 'The smart contract rejected the signature or the threshold requirement math.'}
            </p>
        </div>
    );
}
