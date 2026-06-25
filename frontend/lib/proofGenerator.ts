// lib/proofGenerator.ts
import * as snarkjs from 'snarkjs';

// Helper function to pad coordinate hex strings to exactly 64 characters (32 bytes)
const padHex = (str: string): string => str.padStart(64, '0');

export async function generateProof(balance: number, threshold: number) {
  try {
    const input = {
      balance: balance.toString(),
      threshold: threshold.toString()
    };

    // Passing direct relative paths allows snarkjs's internal Web Worker to fetch files natively
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      '/circuits/balance_proof.wasm',
      '/circuits/circuit_final.zkey'
    );

    // Format fields securely into padded hex blocks 
    const pA = proof.pi_a.slice(0, 2).map((x: string) => padHex(BigInt(x).toString(16)));
    const pB = [
      padHex(BigInt(proof.pi_b[0][1]).toString(16)),
      padHex(BigInt(proof.pi_b[0][0]).toString(16)),
      padHex(BigInt(proof.pi_b[1][1]).toString(16)),
      padHex(BigInt(proof.pi_b[1][0]).toString(16)),
    ];
    const pC = proof.pi_c.slice(0, 2).map((x: string) => padHex(BigInt(x).toString(16)));

    return {
      proof: {
        a: pA.join(''),
        b: pB.join(''),
        c: pC.join(''),
      },
      pubInputs: publicSignals.map((s: string) => s.toString())
    };
  } catch (error) {
    console.error('Proof generation failed:', error);
    throw new Error('Failed to compute zero-knowledge balance proof.');
  }
}
