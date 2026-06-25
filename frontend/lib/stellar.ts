// lib/stellar.ts
import * as StellarSdk from "@stellar/stellar-sdk";
import { rpc } from "@stellar/stellar-sdk";

// Configure the Stellar SDK for Testnet
export const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
export const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";
export const HORIZON_URL = "https://horizon-testnet.stellar.org";

// Create RPC server instance
export const server = new rpc.Server(SOROBAN_RPC_URL);

// Create Horizon server instance
export const horizonServer = new StellarSdk.Horizon.Server(HORIZON_URL);

// Helper to get account details
export const getAccount = async (publicKey: string) => {
    return await server.getAccount(publicKey);
};

// Helper to build a transaction with proper Operation type
export const buildTransaction = (
    sourceAccount: StellarSdk.Account,
    operations: StellarSdk.Operation[],
    timeout: number = 30
) => {
    // Create the transaction builder
    // Fix: Use BASE_FEE.toString() to ensure fee is a string
    const builder = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE.toString(),
        networkPassphrase: NETWORK_PASSPHRASE,
    });
    
    // Add each operation
    operations.forEach(op => {
        // Cast to any to bypass the type checking issue
        builder.addOperation(op as any);
    });
    
    return builder
        .setTimeout(timeout)
        .build();
};

// Alternative: Build transaction with a single operation
export const buildTransactionWithOp = (
    sourceAccount: StellarSdk.Account,
    operation: StellarSdk.Operation,
    timeout: number = 30
) => {
    return new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE.toString(),
        networkPassphrase: NETWORK_PASSPHRASE,
    })
        .addOperation(operation as any)
        .setTimeout(timeout)
        .build();
};