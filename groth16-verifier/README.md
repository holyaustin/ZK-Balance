
stellar contract build

stellar keys generate my-account --network testnet

stellar keys fund my-account

stellar contract deploy --wasm ./target/wasm32v1-none/release/groth16_verifier.wasm --source my-account --network 

or 

NEW_SECURE_ID=$(stellar contract deploy \
  --wasm target/wasm32v1-none/release/groth16_verifier.optimized.wasm \
  --source my-account \
  --network testnet)

echo "Your Real, Secure Contract ID is: $NEW_SECURE_ID"
ℹ️  Uploading contract WASM…
ℹ️  Simulating transaction…
ℹ️  Signing transaction: f5f96b735bea346213ca44aa0197ae63784a06682e35656ac4a99588db040afa
🌎 Sending transaction…
✅ Transaction submitted successfully!
🔗 https://stellar.expert/explorer/testnet/tx/f5f96b735bea346213ca44aa0197ae63784a06682e35656ac4a99588db040afa
ℹ️  Deploying contract using wasm hash d4f40a3496aee547394b3910d41ca00b7420c397dfee320439b2a0e0e78cd658
ℹ️  Simulating transaction…
ℹ️  Signing transaction: 17a533392a041af186e731f75cad451345b3fe40a44fbfcbfd44debd4a588a4d
🌎 Sending transaction…
✅ Transaction submitted successfully!
🔗 https://stellar.expert/explorer/testnet/tx/17a533392a041af186e731f75cad451345b3fe40a44fbfcbfd44debd4a588a4d
🔗 https://lab.stellar.org/r/testnet/contract/CCKF4HGIJZ2T3GJJKJVAWJGFZTZID3LB342DINZH2V2DQT24B5U4HPH7
✅ Deployed!
Your Real, Secure Contract ID is: CCKF4HGIJZ2T3GJJKJVAWJGFZTZID3LB342DINZH2V2DQT24B5U4HPH7


stellar contract info interface \
  --id CCKF4HGIJZ2T3GJJKJVAWJGFZTZID3LB342DINZH2V2DQT24B5U4HPH7 \
  --network testnet