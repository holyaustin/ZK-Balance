// parseKey.js
const fs = require('fs');
const path = require('path');

function toHex32(decStr) {
    return BigInt(decStr).toString(16).padStart(64, '0');
}

// Reorder G2 items to conform with Soroban's native point structure [X0, X1, Y0, Y1]
function parseG2(g2Array) {
    const x0 = toHex32(g2Array[0][1]); // Real part of first coordinate element (beta/gamma/delta)
    const x1 = toHex32(g2Array[0][0]); // Imaginary part of first coordinate element
    const y0 = toHex32(g2Array[1][1]); // Real part of second coordinate element
    const y1 = toHex32(g2Array[1][0]); // Imaginary part of second coordinate element
    return x0 + x1 + y0 + y1;
}

try {
    const vkPath = path.join(__dirname, 'zk_build', 'verification_key.json');
    const vk = JSON.parse(fs.readFileSync(vkPath, 'utf8'));

    console.log("\n📋 --- COPY AND PASTE THESE FRESHLY GENERATED HEX VALUES INTO YOUR verifier.ts ---\n");
    
    console.log(`const vkAlphaG1Bytes = Buffer.from(\n    "${toHex32(vk.vk_alpha_1[0]) + toHex32(vk.vk_alpha_1[1])}",\n    "hex"\n);\n`);
    console.log(`const vkBetaG2Bytes = Buffer.from(\n    "${parseG2(vk.vk_beta_2)}",\n    "hex"\n);\n`);
    console.log(`const vkGammaG2Bytes = Buffer.from(\n    "${parseG2(vk.vk_gamma_2)}",\n    "hex"\n);\n`);
    console.log(`const vkDeltaG2Bytes = Buffer.from(\n    "${parseG2(vk.vk_delta_2)}",\n    "hex"\n);\n`);

    console.log("const vkIcArray = xdr.ScVal.scvVec([");
    vk.IC.forEach((icPoint, index) => {
        const icHex = toHex32(icPoint[0]) + toHex32(icPoint[1]);
        console.log(`    xdr.ScVal.scvBytes(Buffer.from("${icHex}", "hex"))${index < vk.IC.length - 1 ? ',' : ''}`);
    });
    console.log("]);\n");

} catch (err) {
    console.error("Error processing key payload parameters:", err);
}
