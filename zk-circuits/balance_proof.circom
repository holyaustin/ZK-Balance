// This is our Zero-Knowledge circuit
// It proves: "My balance >= threshold" without revealing the exact balance

// Include standard library for comparison operations
include "node_modules/circomlib/circuits/comparators.circom";

// Main template for the balance proof
template BalanceProof() {
    // PRIVATE input: The user's actual balance (never revealed)
    // This is a private input because the user doesn't want to share it
    signal input balance;
    
    // PUBLIC input: The minimum required balance (everyone can see this)
    // This is public because the verifier needs to know what threshold to check
    signal input threshold;
    
    // PUBLIC output: 1 if balance >= threshold, 0 otherwise
    // This is public so the contract can verify the result
    signal output isValid;
    
    // Step 1: Use the LessThan component from circomlib to check if balance >= threshold
    // LessThan returns 1 if in[0] < in[1], else 0
    component lt = LessThan(64);  // 64-bit comparison
    
    // Connect inputs to the comparator
    lt.in[0] <== threshold;        // First input: threshold
    lt.in[1] <== balance;          // Second input: balance
    
    // Step 2: Invert the result
    // If threshold < balance, then balance >= threshold
    // Note: In Circom, all operations must be connected with <==
    isValid <== 1 - lt.out;        // 1 if balance >= threshold
}

// Create the main component
// The public keyword makes 'threshold' visible to the verifier
component main {public [threshold]} = BalanceProof();