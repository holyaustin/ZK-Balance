// lib/verifier.ts
import { 
    Contract, 
    rpc,  
    TransactionBuilder, 
    nativeToScVal,
    Networks,
    BASE_FEE,
    xdr,
} from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

const SOROBAN_URL = process.env.NEXT_PUBLIC_STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || Networks.TESTNET;

// Clean, idiomatic helper to format BigInt strings into strict Soroban U256 structures
function formatU256ScVal(valueString: string): xdr.ScVal {
    const bigIntValue = BigInt(valueString);

    if (bigIntValue < 0n || bigIntValue >= (1n << 256n)) {
        throw new Error(`Value out of U256 range: ${valueString}`);
    }

    return nativeToScVal(bigIntValue, { type: 'u256' });
}

// Helper to pad and convert a coordinate string component into a strict 32-byte big-endian buffer chunk.
//
// FIX: Do not try to "guess" whether the string is hex or decimal by inspecting
// its characters/length — a plain decimal digit string (e.g. snarkjs's default
// "21888242871839275...") is indistinguishable from hex using a character-class
// regex, since 0-9 are valid in both. That heuristic either silently misparses
// long decimal values as hex, or crashes on short hex values that contain a-f.
//
// BigInt() already does this correctly natively: a "0x"-prefixed string is parsed
// as hex, anything else is parsed as decimal. So just preserve the prefix and let
// it decide — don't strip it first.
function padTo32Bytes(coordStr: unknown): Buffer {
    const str = (typeof coordStr === 'string' ? coordStr : String(coordStr)).trim();

    if (str.length === 0) {
        throw new Error('padTo32Bytes received an empty coordinate string');
    }

    let bigIntVal: bigint;
    try {
        bigIntVal = BigInt(str); // handles "0x..." (hex) and plain digits (decimal) correctly
    } catch (e) {
        throw new Error(`padTo32Bytes: could not parse "${str}" as a BigInt: ${(e as Error).message}`);
    }

    if (bigIntVal < 0n || bigIntVal >= (1n << 256n)) {
        throw new Error(`padTo32Bytes: value out of range for a 32-byte field element: ${str}`);
    }

    const hex = bigIntVal.toString(16).padStart(64, '0');
    return Buffer.from(hex, 'hex');
}

export async function verifyOnChain(
    proof: { 
        a: string[];          // ["X", "Y"]
        b: string[][];        // [ ["X1", "X0"], ["Y1", "Y0"] ]
        c: string[]           // ["X", "Y"]
    },
    pubInputs: string[],      // Array containing [isValid, threshold]
    contractId: string,
    publicKey: string
): Promise<boolean> {
    try {
        const server = new rpc.Server(SOROBAN_URL);
        const account = await server.getAccount(publicKey);
        const contract = new Contract(contractId);
        
        // --- 1. FORMAT G1 PROOF POINT COMPONENTS (A and C) WITH EXPLICIT INDEXING ---
        const aBytes = Buffer.concat([
            padTo32Bytes(proof.a[0]),
            padTo32Bytes(proof.a[1])
        ]);

        const cBytes = Buffer.concat([
            padTo32Bytes(proof.c[0]),
            padTo32Bytes(proof.c[1])
        ]);
        
        // --- 2. DYNAMICALLY REORDER PROOF B (From SnarkJS X1,X0,Y1,Y0 to Soroban X0,X1,Y0,Y1) ---
        // SnarkJS maps array layout as: proof.b[0] = [X1, X0], proof.b[1] = [Y1, Y0]
        const bBytes = Buffer.concat([
            padTo32Bytes(proof.b[0][1]), // Real Part X0 leads
            padTo32Bytes(proof.b[0][0]), // Imaginary Part X1 follows
            padTo32Bytes(proof.b[1][1]), // Real Part Y0 leads
            padTo32Bytes(proof.b[1][0])  // Imaginary Part Y1 follows
        ]);
        
        // --- 3. COPIED FRESH CRYPTOGRAPHIC CIRCUIT KEYS ---
        const vkAlphaG1Bytes = Buffer.from(
            "2d4d9aa7e302d9df41749d5507949d05dbea33fbb16c643b22f599a2be6df2e214bedd503c37ceb061d8ec60209fe345ce89830a19230301f076caff004d1926",
            "hex"
        );

        const vkBetaG2Bytes = Buffer.from(
            "0967032fcbf776d1afc985f88877f182d38480a653f2decaa9794cbc3bf3060c0e187847ad4c798374d0d6732bf501847dd68bc0e071241e0213bc7fc13db7ab304cfbd1e08a704a99f5e847d93f8c3caafddec46b7a0d379da69a4d112346a71739c1b1a457a8c7313123d24d2f9192f896b7c63eea05a9d57f06547ad0cec8",
            "hex"
        );

        const vkGammaG2Bytes = Buffer.from(
            "198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c21800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed090689d0585ff075ec9e99ad690c3395bc4b313370b38ef355acdadcd122975b12c85ea5db8c6deb4aab71808dcb408fe3d1e7690c43d37b4ce6cc0166fa7daa",
            "hex"
        );

        const vkDeltaG2Bytes = Buffer.from(
            "04ffc466e6f731bbcc05131f7c23756d8c579bd343364d244081ef4ca0ee294e205044235f15f40642dc0f3c59cfdb5eae32f240cdf6d93ce31f3cfa6e0c4d481cc130a79194166ca3b44f62237c8f9a588ee6510c0531884ba37e88a8ba14d02f06ddc0afc22b193168d5b96fc1bcc5b0a1148ec72ade81d861b618d8c79406",
            "hex"
        );
        
        const vkIcArray = xdr.ScVal.scvVec([
            xdr.ScVal.scvBytes(Buffer.from("2790a6758c998ad2dc2f2e318d96ec58e404fffe80d5cf73e4dae107032730f610a771a1bec51174ab392ef7ae23031d1ddd86be8c926c58c7b7d1e379255d5e", "hex")),
            xdr.ScVal.scvBytes(Buffer.from("2e05c1507edb4898162f12b24f4699faeb9b40aea5e7f5fc879f1b295081a0ed2e5ed8468f527c46811460c7c5995548825b09c6fb1840f24bd8d59fc6a7dcb5", "hex")),
            xdr.ScVal.scvBytes(Buffer.from("293c0528891d5e5d7811887ccbf365091c3ae61a918aad61dc87bc526e059ef21a4f769adf9892f5de662a948041cc85f2f9b4f8f55ac89aa39d13d4c6e4dd91", "hex"))
        ]);

        // Build transaction passing all 10 verified parameters with distinct array indexes
        let tx = new TransactionBuilder(account, {
            fee: BASE_FEE.toString(),
            networkPassphrase: NETWORK_PASSPHRASE,
        })
        .addOperation(contract.call('verify_balance', 
            nativeToScVal(aBytes, { type: 'bytes' }),
            nativeToScVal(bBytes, { type: 'bytes' }),
            nativeToScVal(cBytes, { type: 'bytes' }),
            formatU256ScVal(pubInputs[1]), // threshold is index 1
            formatU256ScVal(pubInputs[0]), // isValid is index 0
            nativeToScVal(vkAlphaG1Bytes, { type: 'bytes' }),
            nativeToScVal(vkBetaG2Bytes, { type: 'bytes' }),
            nativeToScVal(vkGammaG2Bytes, { type: 'bytes' }),
            nativeToScVal(vkDeltaG2Bytes, { type: 'bytes' }),
            vkIcArray
        ))
        .setTimeout(30)
        .build();
        
        console.log('🔬 Simulating Soroban resources...');
        tx = await server.prepareTransaction(tx);
        
        console.log('🔑 Requesting transaction signature via Freighter...');
        const signedResult = await signTransaction(tx.toXDR(), {
            networkPassphrase: NETWORK_PASSPHRASE,
        });
        
        const signedXdrStr = typeof signedResult === 'string' ? signedResult : signedResult.signedTxXdr;
        
        if (!signedXdrStr) {
            throw new Error("Failed to extract valid signed XDR from Freighter.");
        }

        const signedTx = TransactionBuilder.fromXDR(signedXdrStr, NETWORK_PASSPHRASE);
        
        console.log('📨 Broadcasting signed transaction...');
        const sendResponse = await server.sendTransaction(signedTx);
        
        if (sendResponse.status === 'ERROR') {
            throw new Error("Transaction submission failed: " + JSON.stringify(sendResponse.errorResult));
        }
        
        let getResponse = await server.getTransaction(sendResponse.hash) as any;
        
        while (getResponse.status === 'PENDING' || getResponse.status === 'NOT_FOUND') {
            console.log('⏳ Waiting for transaction confirmation...');
            await new Promise((resolve) => setTimeout(resolve, 1500));
            getResponse = await server.getTransaction(sendResponse.hash) as any;
        }
        
        if (getResponse.status === 'SUCCESS') {
            console.log('✅ On-Chain Verification successful!');
            return true;
        }
        
        console.error('Transaction execution failed:', getResponse);
        return false;
    } catch (error) {
        console.error('Verification pipeline crash:', error);
        return false;
    }
}