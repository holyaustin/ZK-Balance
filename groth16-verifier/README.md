
stellar contract build

stellar keys generate my-account --network testnet

stellar keys fund my-account

stellar contract deploy --wasm ./target/wasm32v1-none/release/groth16_verifier.wasm --source my-account --network testnet

ℹ️  Uploading contract WASM…
ℹ️  Simulating transaction…
ℹ️  Signing transaction: 85d615cd7227c58c173aa85f803434a556ebb15f8fe89d827438b8aa321584e4
🌎 Sending transaction…
✅ Transaction submitted successfully!
🔗 https://stellar.expert/explorer/testnet/tx/85d615cd7227c58c173aa85f803434a556ebb15f8fe89d827438b8aa321584e4
ℹ️  Deploying contract using wasm hash d80f2ce91e519df2812c7ee929320a229be87716dd7139fa34de3b5c127e32bf
ℹ️  Simulating transaction…
ℹ️  Signing transaction: decabd4b54a983efded74ab7717c08b8a85e593661c19fd7c340fc573965e8f4
🌎 Sending transaction…
✅ Transaction submitted successfully!
🔗 https://stellar.expert/explorer/testnet/tx/decabd4b54a983efded74ab7717c08b8a85e593661c19fd7c340fc573965e8f4
🔗 https://lab.stellar.org/r/testnet/contract/CD2P4KGTH75CPCE6EPQP37RGLUY2A5RJQU5GXCR76P3DBMKD2F66BPEZ
✅ Deployed!
CD2P4KGTH75CPCE6EPQP37RGLUY2A5RJQU5GXCR76P3DBMKD2F66BPEZ