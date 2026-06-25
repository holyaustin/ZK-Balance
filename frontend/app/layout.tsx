import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'ZK-Balance - Prove Funds Without Revealing Balance',
    description: 'Zero-knowledge proof of funds on Stellar',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            {/* Tailwind v4 text-foreground/background mapped from CSS variables */}
            <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
                <div className="flex min-h-screen flex-col">
                    <nav className="border-b border-border bg-card shadow-xs transition-colors duration-200">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="flex h-16 items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-2xl font-extrabold text-primary">ZK</span>
                                    <span className="text-2xl font-bold tracking-tight text-foreground">Balance</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <a 
                                        href="https://github.com/yourusername/zk-balance" 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted hover:text-foreground transition-colors duration-200"
                                        aria-label="GitHub Repository"
                                    >
                                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.15 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.62.24 2.85.12 3.15.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </nav>

                    <div className="flex-1">
                        {children}
                    </div>

                    <footer className="border-t border-border bg-card mt-auto transition-colors duration-200">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                            <p className="text-center text-sm font-medium text-muted">
                                Built for Stellar Hacks • Powered by ZK Proofs
                            </p>
                        </div>
                    </footer>
                </div>
            </body>
        </html>
    );
}
