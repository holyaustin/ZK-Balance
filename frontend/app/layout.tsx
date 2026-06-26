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
