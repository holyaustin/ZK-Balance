
stellar contract build

stellar keys generate my-account --network testnet

stellar keys fund my-account

stellar contract deploy --wasm ./target/wasm32v1-none/release/groth16_verifier.wasm --source my-account --network 

or 

CONTRACT_ID=$(stellar contract deploy \
  --wasm target/wasm32v1-none/release/groth16_verifier.optimized.wasm \
  --source my-account \
  --network testnet)

echo "Your Live Contract ID is: $CONTRACT_ID"


ℹ️  Uploading contract WASM…
ℹ️  Skipping install because wasm already installed
ℹ️  Deploying contract using wasm hash f2cf0cd04282851d43461cadcf8ffa522f60a2c33edd67531f588f73e0980c06
ℹ️  Simulating transaction…
ℹ️  Signing transaction: aa18c91a73303a9eff397f2e967e561491f53975c20189228fe226cf05bd6807
🌎 Sending transaction…
✅ Transaction submitted successfully!
🔗 https://stellar.expert/explorer/testnet/tx/aa18c91a73303a9eff397f2e967e561491f53975c20189228fe226cf05bd6807
🔗 https://lab.stellar.org/r/testnet/contract/CDGMQGOMA4BRMADGC3CXLSZAGSSUPJ7KPKLCMR6U6KWSE54DL2VKUJRK
✅ Deployed!