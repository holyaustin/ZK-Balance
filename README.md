# ZK-Balance — Proof of Funds Without Revealing Balance
## Description
A web app that lets a Stellar user prove they hold at least a specified minimum balance of a specific asset (e.g., USDC) without revealing their exact balance. The user generates a ZK proof off-chain, submits it to a Soroban verifier contract, and the contract returns a simple true/false — the user either meets the threshold or they don't. This is the classic "range proof" / "proof-of-balance" pattern — a perfect first ZK project.

Real-world use case: A tenant proving they have enough funds for a security deposit to a landlord, or a trader proving they meet a minimum balance requirement for a DeFi pool, without broadcasting their wallet balance to the world.

## Tools & Tech Stack
Component	Technology
ZK Framework	Circom 2.0 + Groth16 (smallest proofs, cheapest to verify on Stellar)
ZK DevKit	stellar-zk — unified CLI that handles circuit compilation, proof generation, contract deployment, and on-chain verification
Smart Contract	Soroban Groth16 verifier contract (BN254)
Frontend	React + TypeScript + @stellar/stellar-sdk
Network	Stellar Testnet