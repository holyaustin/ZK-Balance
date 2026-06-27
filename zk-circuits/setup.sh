#!/bin/bash
# setup.sh
set -e

echo "📦 Setting up dependencies..."
npm install circomlib snarkjs

# Clear out any stale/corrupted pieces
rm -rf ./zk_build/powersOfTau28_hez_final_12.ptau
mkdir -p ./zk_build
mkdir -p ../public/zk

echo "🔨 Compiling the circuit..."
circom balance_proof.circom --r1cs --wasm --sym -l ./node_modules

# FIX: Download from the real Hermez ptau file location (with a GCS mirror
# fallback), and validate the result before handing it to snarkjs.
echo "📥 Downloading official binary Powers of Tau Phase 1 file synchronously..."
node -e '
const https = require("https");
const fs = require("fs");

const PRIMARY_URL  = "https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau";
const FALLBACK_URL = "https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_12.ptau";

function downloadFile(url, targetPath, fallbackUrl) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(targetPath);

        https.get(url, (response) => {
            // Handle HTTP redirects (301, 302) smoothly
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                file.close();
                fs.unlink(targetPath, () => {});
                downloadFile(response.headers.location, targetPath, fallbackUrl).then(resolve).catch(reject);
                return;
            }

            if (response.statusCode !== 200) {
                file.close();
                fs.unlink(targetPath, () => {});
                if (fallbackUrl) {
                    console.log(`⚠️  Primary source failed (status ${response.statusCode}), trying mirror...`);
                    downloadFile(fallbackUrl, targetPath, null).then(resolve).catch(reject);
                } else {
                    reject(new Error(`Failed to download: Status Code ${response.statusCode}`));
                }
                return;
            }

            response.pipe(file);
            file.on("finish", () => {
                file.close(() => {
                    try {
                        // Validate: real .ptau files start with the ASCII magic bytes "ptau"
                        const fd = fs.openSync(targetPath, "r");
                        const header = Buffer.alloc(4);
                        fs.readSync(fd, header, 0, 4, 0);
                        fs.closeSync(fd);

                        const size = fs.statSync(targetPath).size;

                        if (header.toString("ascii") !== "ptau" || size < 1000) {
                            fs.unlink(targetPath, () => {});
                            if (fallbackUrl) {
                                console.log(`⚠️  Downloaded file failed validation (size=${size}, header="${header.toString("ascii")}"), trying mirror...`);
                                downloadFile(fallbackUrl, targetPath, null).then(resolve).catch(reject);
                            } else {
                                reject(new Error(`Downloaded file is not a valid .ptau (size=${size}, header="${header.toString("ascii")}")`));
                            }
                            return;
                        }

                        console.log(`📊 Valid .ptau saved to ${targetPath} (${size} bytes)`);
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                });
            });
        }).on("error", (err) => {
            fs.unlink(targetPath, () => {});
            reject(err);
        });
    });
}

(async () => {
    try {
        await downloadFile(PRIMARY_URL, "./zk_build/powersOfTau28_hez_final_12.ptau", FALLBACK_URL);
    } catch (e) {
        console.error("❌ Download engine failure:", e.message);
        process.exit(1);
    }
})();
'

echo "🔐 Running Groth16 Trusted Setup..."
snarkjs groth16 setup ./balance_proof.r1cs ./zk_build/powersOfTau28_hez_final_12.ptau ./zk_build/balance_proof_0000.zkey

echo "🎲 Contributing Entropy to Proving Key..."
snarkjs zkey contribute ./zk_build/balance_proof_0000.zkey ./zk_build/balance_proof_final.zkey --name="VerifierDeployer" -v -e="StellarSorobanZKAssetThresholdVerification2026"

echo "📄 Exporting verification_key.json..."
snarkjs zkey export verificationkey ./zk_build/balance_proof_final.zkey ./zk_build/verification_key.json

echo "🚚 Deploying runtime assets to Next.js public/zk directory..."
cp ./zk_build/balance_proof_final.zkey ../public/zk/balance_proof.zkey
cp ./balance_proof_js/balance_proof.wasm ../public/zk/balance_proof.wasm
cp ./zk_build/verification_key.json ../public/zk/verification_key.json

echo "✅ End-to-End Setup Complete! Browser prover assets are ready inside public/zk/"