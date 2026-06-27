pragma circom 2.1.6;

// Include standard library for comparison operations
include "circomlib/circuits/comparators.circom";

// Main template for the balance proof
template BalanceProof() {
    // PRIVATE input: The user's actual balance (never revealed)
    signal input balance;
    
    // PUBLIC input: The minimum required balance (everyone can see this)
    signal input threshold;
    
    // PUBLIC output: 1 if balance >= threshold, 0 otherwise
    signal output isValid;
    
    // Step 1: LessThan returns 1 if in[0] < in[1], else 0
    component lt = LessThan(64);  // 64-bit comparison
    
    // Connect inputs to the comparator
    lt.in[0] <== balance;       // Put balance first
    lt.in[1] <== threshold;     // Put threshold second
    
    // Step 2: Invert the result
    // If balance >= threshold, lt.out will be 0, making isValid = 1 - 0 = 1
    isValid  <== 1 - lt.out;    
}

// Create the main component and expose 'threshold' to the verifier
component main {public [threshold]} = BalanceProof();
