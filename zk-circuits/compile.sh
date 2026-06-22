#!/bin/bash
# This script compiles our Circom circuit into a format we can use

echo "📦 Setting up Circomlib..."
# Install circomlib (the standard library for Circom)
npm install -g circomlib

echo "🔨 Compiling the circuit..."
# Compile the circuit to R1CS format (binary constraints)
circom balance_proof.circom --r1cs --wasm --sym

echo "✅ Compilation complete!"
echo "Generated files:"
echo "  - balance_proof.r1cs: The constraint system"
echo "  - balance_proof.wasm: WebAssembly for witness generation"
echo "  - balance_proof.sym: Symbol file for debugging"