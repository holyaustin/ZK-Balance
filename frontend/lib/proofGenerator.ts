// lib/proofGenerator.ts
import * as snarkjs from 'snarkjs';

const padHex = (str: string): string => str.padStart(64, '0');

export async function generateProof(balance: number, threshold: number) {
  try {
    const input = {
      balance: balance.toString(),
      threshold: threshold.toString()
    };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      '/circuits/balance_proof.wasm',
      '/circuits/circuit_final.zkey'
    );

    // CRITICAL FIX: Format G2 point correctly for the contract
    // The contract expects B as: [x1, x2, y1, y2] where each is 32 bytes
    // But snarkjs returns pi_b as [[x1, x2], [y1, y2]]
    const formatG1 = (point: any[]): string => {
      return point.slice(0, 2)
        .map((x: any) => padHex(BigInt(x).toString(16)))
        .join('');
    };

    const formatG2 = (point: any[]): string => {
      // point is [[x1, x2], [y1, y2]]
      // We need: [x1, x2, y1, y2]
      const x1 = padHex(BigInt(point[0][0]).toString(16));
      const x2 = padHex(BigInt(point[0][1]).toString(16));
      const y1 = padHex(BigInt(point[1][0]).toString(16));
      const y2 = padHex(BigInt(point[1][1]).toString(16));
      return x1 + x2 + y1 + y2;
    };

    return {
      proof: {
        a: formatG1(proof.pi_a),
        b: formatG2(proof.pi_b),
        c: formatG1(proof.pi_c),
      },
      pubInputs: publicSignals.map((s: string) => s.toString())
    };
  } catch (error) {
    console.error('Proof generation failed:', error);
    throw new Error('Failed to compute zero-knowledge balance proof.');
  }
}