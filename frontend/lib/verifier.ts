// lib/verifier.ts
import { 
    Contract, 
    rpc,  
    TransactionBuilder, 
    nativeToScVal,
    Networks,
    BASE_FEE,
} from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

const SOROBAN_URL = process.env.NEXT_PUBLIC_STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || Networks.TESTNET;

export async function verifyOnChain(
    proof: { a: string; b: string; c: string },
    pubInputs: string[],
    contractId: string,
    publicKey: string
): Promise<boolean> {
    try {
        const server = new rpc.Server(SOROBAN_URL);
        const account = await server.getAccount(publicKey);
        const contract = new Contract(contractId);
        
        const aBytes = Buffer.from(proof.a, 'hex');
        const bBytes = Buffer.from(proof.b, 'hex');
        const cBytes = Buffer.from(proof.c, 'hex');
        
        // Build the transaction with fee as string
        let tx = new TransactionBuilder(account, {
            fee: BASE_FEE.toString(),
            networkPassphrase: NETWORK_PASSPHRASE,
        })
        .addOperation(contract.call('verify_balance', 
            nativeToScVal(aBytes, { type: 'bytes' }),
            nativeToScVal(bBytes, { type: 'bytes' }),
            nativeToScVal(cBytes, { type: 'bytes' }),
            nativeToScVal(BigInt(pubInputs[0]), { type: 'u256' }),
            nativeToScVal(BigInt(pubInputs[1]), { type: 'u256' })
        ))
        .setTimeout(30)
        .build();
        
        // Prepare the transaction (simulate and set fees)
        console.log('🔬 Simulating Soroban resources...');
        tx = await server.prepareTransaction(tx);
        
        console.log('🔑 Requesting transaction signature via Freighter...');
        const signedResult = await signTransaction(tx.toXDR(), {
            networkPassphrase: NETWORK_PASSPHRASE,
        });
        
        // Handle both string and object return types
        const signedXdrStr = typeof signedResult === 'string' ? signedResult : signedResult.signedTxXdr;
        
        if (!signedXdrStr) {
            throw new Error("Failed to extract valid signed XDR from Freighter.");
        }

        const signedTx = TransactionBuilder.fromXDR(
            signedXdrStr,
            NETWORK_PASSPHRASE
        );
        
        console.log('📨 Broadcasting signed transaction...');
        const sendResponse = await server.sendTransaction(signedTx);
        
        if (sendResponse.status === 'ERROR') {
            throw new Error(`Transaction submission failed: ${JSON.stringify(sendResponse.errorResult)}`);
        }
        
        // Poll for completion - using any to bypass type checking
        let getResponse = await server.getTransaction(sendResponse.hash) as any;
        
        while (getResponse.status === 'PENDING' || getResponse.status === 'NOT_FOUND') {
            console.log('⏳ Waiting for transaction confirmation...');
            await new Promise((resolve) => setTimeout(resolve, 1500));
            getResponse = await server.getTransaction(sendResponse.hash) as any;
        }
        
        // Check if transaction succeeded
        if (getResponse.status === 'SUCCESS') {
            if (getResponse.resultMetaXdr || getResponse.resultXdr) {
                console.log('✅ On-Chain Verification successful!');
                return true;
            }
            console.log('✅ Verification transaction succeeded!');
            return true;
        }
        
        console.error('Transaction execution failed:', getResponse);
        return false;
    } catch (error) {
        console.error('Verification pipeline crash:', error);
        return false;
    }
}