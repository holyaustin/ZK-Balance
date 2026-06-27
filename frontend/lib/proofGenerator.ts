// lib/proofGenerator.ts
import { groth16 } from "snarkjs";

interface ProofOutput {
    proof: {
        a: string[];
        b: string[][];
        c: string[];
    };
    pubInputs: string[];
}

export async function generateProof(
    balanceInStroops: number,
    thresholdInStroops: number
): Promise<ProofOutput> {
    // Points explicitly matching your public asset deployment paths
    const wasmPath = "/zk/balance_proof.wasm";
    const zkeyPath = "/zk/balance_proof.zkey";

    const privateInputs = {
        balance: balanceInStroops.toString(),
        threshold: thresholdInStroops.toString()
    };

    // Run the native browser SnarkJS worker engine
    const { proof, publicSignals } = await groth16.fullProve(
        privateInputs,
        wasmPath,
        zkeyPath
    );

    return {
        proof: {
            a: proof.pi_a.slice(0, 2),
            b: proof.pi_b.slice(0, 2),
            c: proof.pi_c.slice(0, 2)
        },
        pubInputs: publicSignals // Outputs: [isValid, threshold]
    };
}
