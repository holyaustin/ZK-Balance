#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl,
    BytesN, Env, U256, Vec,
    crypto::bn254::{Bn254G1Affine, Bn254G2Affine, Fr},
};

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
    /// Verify a Groth16 proof using a verification key
    pub fn verify(
        env: Env,
        a: BytesN<64>,           
        b: BytesN<128>,          
        c: BytesN<64>,           
        public_inputs: Vec<U256>,
        vk_alpha_g1: BytesN<64>,    // Fixed VK point [α]1
        vk_beta_g2: BytesN<128>,    // Fixed VK point [β]2
        vk_gamma_g2: BytesN<128>,   // Fixed VK point [γ]2
        vk_delta_g2: BytesN<128>,   // Fixed VK point [δ]2
        vk_ic: Vec<BytesN<64>>,     // Circuit-specific IC points for inputs
    ) -> bool {
        // 1. Parse base proof components
        let g1_a = Bn254G1Affine::from_bytes(a);
        let g2_b = Bn254G2Affine::from_bytes(b);
        let g1_c = Bn254G1Affine::from_bytes(c);

        if public_inputs.len() + 1 != vk_ic.len() {
            return false;
        }

        // 2. Compute the Public Inputs Accumulator (MSM: IC + ∑ (input_i * IC[i+1]))
        let mut vk_x = Bn254G1Affine::from_bytes(vk_ic.get(0).unwrap());
        
        for i in 0..public_inputs.len() {
            let input = public_inputs.get(i).unwrap();
            let ic_point = Bn254G1Affine::from_bytes(vk_ic.get(i + 1).unwrap());
            
            let scalar_input = Fr::from(input);
            vk_x = vk_x + (ic_point * scalar_input);
        }

        // 3. Construct elements for the multi-pairing check
        // Mathematical identity holds true: e(A, B) * e(-X, Γ) * e(-C, Δ) * e(-α, β) = 1
        let mut g1_points = Vec::new(&env);
        g1_points.push_back(g1_a);
        g1_points.push_back(-vk_x);
        g1_points.push_back(-g1_c);
        g1_points.push_back(-Bn254G1Affine::from_bytes(vk_alpha_g1));
        
        let mut g2_points = Vec::new(&env);
        g2_points.push_back(g2_b);
        g2_points.push_back(Bn254G2Affine::from_bytes(vk_gamma_g2));
        g2_points.push_back(Bn254G2Affine::from_bytes(vk_delta_g2));
        g2_points.push_back(Bn254G2Affine::from_bytes(vk_beta_g2));
        
        // 4. Execute optimized host call
        env.crypto().bn254().pairing_check(g1_points, g2_points)
    }

    /// Application-specific helper function checking threshold boundaries
    pub fn verify_balance(
        env: Env,
        a: BytesN<64>,
        b: BytesN<128>,
        c: BytesN<64>,
        threshold: U256,
        is_valid: U256,
        vk_alpha_g1: BytesN<64>,
        vk_beta_g2: BytesN<128>,
        vk_gamma_g2: BytesN<128>,
        vk_delta_g2: BytesN<128>,
        vk_ic: Vec<BytesN<64>>,
    ) -> bool {
        // [is_valid, threshold] matches the strict layout order of the Circom circuit public signals
        let public_inputs = Vec::from_array(&env, [is_valid.clone(), threshold]);
        
        let proof_valid = Self::verify(
            env.clone(), a, b, c, public_inputs,
            vk_alpha_g1, vk_beta_g2, vk_gamma_g2, vk_delta_g2, vk_ic
        );
        
        let output_valid = is_valid == U256::from_u32(&env, 1);
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
        
        let a = BytesN::<64>::from_array(&env, &[0u8; 64]);
        let b = BytesN::<128>::from_array(&env, &[0u8; 128]);
        let c = BytesN::<64>::from_array(&env, &[0u8; 64]);
        let threshold = U256::from_u32(&env, 100);
        let is_valid = U256::from_u32(&env, 1);

        let vk_alpha = BytesN::<64>::from_array(&env, &[0u8; 64]);
        let vk_beta = BytesN::<128>::from_array(&env, &[0u8; 128]);
        let vk_gamma = BytesN::<128>::from_array(&env, &[0u8; 128]);
        let vk_delta = BytesN::<128>::from_array(&env, &[0u8; 128]);
        
        let mut vk_ic = Vec::new(&env);
        vk_ic.push_back(BytesN::<64>::from_array(&env, &[0u8; 64]));
        vk_ic.push_back(BytesN::<64>::from_array(&env, &[0u8; 64]));
        vk_ic.push_back(BytesN::<64>::from_array(&env, &[0u8; 64]));

        let result = Groth16Verifier::verify_balance(
            env, a, b, c, threshold, is_valid,
            vk_alpha, vk_beta, vk_gamma, vk_delta, vk_ic
        );
        
        assert_eq!(result, false);
    }
}
