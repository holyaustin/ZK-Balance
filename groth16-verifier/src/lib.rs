#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, 
    BytesN, Env, U256, Vec,
    crypto::bn254::{Bn254G1Affine, Bn254G2Affine},
};

// Fix 1: Renamed from 'Error' to avoid clashing with the SDK's internal error types
// Fix 2: Changed from #[contracttype] to #[contracterror] for clean execution reverts
#[contracterror]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ContractError {
    InvalidProof = 1,
    InvalidInputs = 2,
    VerificationFailed = 3,
}

#[contract]
pub struct Groth16Verifier;

#[contractimpl]
impl Groth16Verifier {
    /// Verify a Groth16 proof
    /// 
    /// # Arguments
    /// * `a` - The A point of the proof (G1 point, 64 bytes)
    /// * `b` - The B point of the proof (G2 point, 128 bytes)
    /// * `c` - The C point of the proof (G1 point, 64 bytes)
    /// * `public_inputs` - The public inputs and output
    pub fn verify(
        env: Env,
        a: BytesN<64>,           
        b: BytesN<128>,          
        c: BytesN<64>,           
        _public_inputs: Vec<U256>, // Prepended with '_' until you pass it to multi-pairing calculations
    ) -> bool {
        // Fix 3: In v25, from_bytes consumes the BytesN object directly without `&env` or references.
        let g1_a = Bn254G1Affine::from_bytes(a);
        let g2_b = Bn254G2Affine::from_bytes(b);
        let g1_c = Bn254G1Affine::from_bytes(c);

        // Fix 4: Set up vectors passing types by value into the host pairing validator
        let mut g1_points = Vec::new(&env);
        let mut g2_points = Vec::new(&env);

        g1_points.push_back(g1_a);
        g1_points.push_back(g1_c);
        
        g2_points.push_back(g2_b);
        
        // Note: For a fully operational Groth16 verification, you will need to push the 
        // compiled VK Gamma/Delta points combined with your public inputs into these vectors.
        
        // Fix 5: Access the Protocol 25 native pairing check via env.crypto().bn254()
        let pairing_result = env.crypto().bn254().pairing_check(g1_points, g2_points);

        pairing_result
    }

    /// A helper function to verify the proof and also check the output
    pub fn verify_balance(
        env: Env,
        a: BytesN<64>,
        b: BytesN<128>,
        c: BytesN<64>,
        threshold: U256,
        is_valid: U256,
    ) -> bool {
        // Fix 6: U256 represents a host object and does not implement Copy. 
        // We must clone `is_valid` before it gets consumed inside the array allocation.
        let public_inputs = Vec::from_array(&env, [threshold, is_valid.clone()]);
        
        // Verify the proof
        let proof_valid = Self::verify(env.clone(), a, b, c, public_inputs);
        
        // Also verify that the output is 1 (meaning balance >= threshold)
        let output_valid = is_valid == U256::from_u32(&env, 1);
        
        // Return true only if both conditions are met
        proof_valid && output_valid
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::Env;

    #[test]
    fn test_verifier_setup() {
        let env = Env::default();
        
        // Generate mock point inputs zeroed out for unit testing
        let a = BytesN::<64>::from_array(&env, &[0u8; 64]);
        let b = BytesN::<128>::from_array(&env, &[0u8; 128]);
        let c = BytesN::<64>::from_array(&env, &[0u8; 64]);
        let threshold = U256::from_u32(&env, 100);
        let is_valid = U256::from_u32(&env, 1);

        let result = Groth16Verifier::verify_balance(
            env, a, b, c, threshold, is_valid
        );
        
        // Asserting false as zeroed inputs do not constitute a mathematically sound Groth16 proof
        assert_eq!(result, false);
    }
}
