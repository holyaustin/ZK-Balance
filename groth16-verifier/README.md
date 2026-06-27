
stellar contract build

stellar keys generate my-account --network testnet

stellar keys fund my-account

stellar contract deploy --wasm ./target/wasm32v1-none/release/groth16_verifier.wasm --source my-account --network 

or 

stellar contract deploy --wasm target/wasm32v1-none/release/groth16_verifier.optimized.wasm --source my-account --network testnet
ℹ️  Uploading contract WASM…
ℹ️  Skipping install because wasm already installed
ℹ️  Deploying contract using wasm hash f2cf0cd04282851d43461cadcf8ffa522f60a2c33edd67531f588f73e0980c06
ℹ️  Simulating transaction…
ℹ️  Signing transaction: c10645b64af9d48432403df18a3962baa67c41c3e4fcad800dadc440d59cb147
🌎 Sending transaction…
✅ Transaction submitted successfully!
🔗 https://stellar.expert/explorer/testnet/tx/c10645b64af9d48432403df18a3962baa67c41c3e4fcad800dadc440d59cb147
🔗 https://lab.stellar.org/r/testnet/contract/CBOVWWXTO35QZFO6TPTL2HNNWAW2TWNJO537ZLMN7JHCXSAJU37ZVUAT
✅ Deployed!
CBOVWWXTO35QZFO6TPTL2HNNWAW2TWNJO537ZLMN7JHCXSAJU37ZVUAT


stellar contract info interface \
  --id CBOVWWXTO35QZFO6TPTL2HNNWAW2TWNJO537ZLMN7JHCXSAJU37ZVUAT \
  --network testnet