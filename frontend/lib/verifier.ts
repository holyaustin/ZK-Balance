// lib/verifier.ts
import { 
    Contract, 
    rpc,  
    TransactionBuilder, 
    nativeToScVal,
    scValToNative
} from '@stellar/stellar-sdk';

const RPC_URL = process.env.NEXT_PUBLIC_STELLAR_RPC_URL || 'https://rpc-testnet.stellar.org';
const NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';

export async function verifyOnChain(
    proof: { a: string; b: string; c: string },
    pubInputs: string[],
    contractId: string,
    publicKey: string
): Promise<boolean> {
    try {
        const server = new rpc.Server(RPC_URL);
        const account = await server.getAccount(publicKey);
        const contract = new Contract(contractId);
        
        const aBytes = Buffer.from(proof.a, 'hex');
        const bBytes = Buffer.from(proof.b, 'hex');
        const cBytes = Buffer.from(proof.c, 'hex');
        
        const args = [
            nativeToScVal(aBytes, { type: 'bytes' }),
            nativeToScVal(bBytes, { type: 'bytes' }),
            nativeToScVal(cBytes, { type: 'bytes' }),
            nativeToScVal(BigInt(pubInputs[0]), { type: 'u256' }), // threshold
            nativeToScVal(BigInt(pubInputs[1]), { type: 'u256' }), // is_valid
        ];
        
        let tx = new TransactionBuilder(account, {
            fee: '100000', 
            networkPassphrase: NETWORK_PASSPHRASE,
        })
        .addOperation(contract.call('verify_balance', ...args))
        .setTimeout(30)
        .build();
        
        console.log('🔬 Simulating Soroban resources...');
        tx = await server.prepareTransaction(tx);
        
        console.log('🔑 Forwarding payload to extension signing module...');
        const isFreighterAvailable = typeof window !== 'undefined' && (window as any).freighter;
        if (!isFreighterAvailable) {
            throw new Error('Signing failed: Freighter extension context is unavailable.');
        }

        // Sign transaction using standard injected window handler format
        const signedResult = await (window as any).freighter.signTransaction({
            xdr: tx.toXDR(),
            network: 'TESTNET',
            accountToSign: publicKey,
        });

        const signedXDR = typeof signedResult === 'string' ? signedResult : signedResult.signedTxXdr;
        
        console.log('📨 Sending transaction payload...');
        const response = await server.sendTransaction(TransactionBuilder.fromXDR(signedXDR, NETWORK_PASSPHRASE));
        
        if (response.status === 'ERROR') {
            throw new Error(`Submission Error: ${JSON.stringify(response.errorResult)}`);
        }
        
        // Loop and poll until transaction is processed
        let txResult = await server.getTransaction(response.hash) as any;
        
        // Fix: Use direct matching to account for literal string variations safely
        while (txResult.status === 'pending' || txResult.status === 'PENDING') {
            await new Promise(resolve => setTimeout(resolve, 1500));
            txResult = await server.getTransaction(response.hash) as any;
        }
        
        // Fix: Safe dynamic string mapping check for successful ledger processing block
        if (txResult.status === 'success' || txResult.status === 'SUCCESS') {
            if (txResult.resultMetaXdr || txResult.resultXdr) {
                console.log('🎉 Verification transaction verified successfully on-chain!');
                return true;
            }
        }
        
        console.error('Ledger Execution Failure:', txResult);
        return false;
    } catch (error) {
        console.error('Verification failed:', error);
        return false;
    }
}
