// scripts/deploy-verifier.js
const { 
    Keypair,
    SorobanRpc, 
    TransactionBuilder, 
    Networks, 
    Operation,
    asAddress
} = require('@stellar/stellar-sdk');
const fs = require('fs');

// Configuration
const RPC_URL = 'https://rpc-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;
// Fix 1: Adjusted target directory to match native stellar-cli output format
const CONTRACT_WASM_PATH = './target/wasm32v1-none/release/groth16_verifier.wasm';

// Replace with your actual secret key
const SECRET_KEY = 'S...'; 

async function deployVerifier() {
    console.log('🚀 Starting deployment steps...');

    const rpc = new SorobanRpc.Server(RPC_URL);
    const keypair = Keypair.fromSecret(SECRET_KEY);
    const publicKey = keypair.publicKey();
    
    console.log(`✅ Connected as: ${publicKey}`);

    if (!fs.existsSync(CONTRACT_WASM_PATH)) {
        throw new Error(`WASM file not found at ${CONTRACT_WASM_PATH}. Run 'stellar contract build' first.`);
    }
    const wasm = fs.readFileSync(CONTRACT_WASM_PATH);
    console.log(`📄 Contract WASM size: ${wasm.length} bytes`);

    // --- PHASE 1: UPLOAD WASM ---
    console.log('📤 Preparing WASM upload transaction...');
    let account = await rpc.getAccount(publicKey);
    
    let uploadTx = new TransactionBuilder(account, {
        fee: '100000', // Base fallback fee, will be updated by simulation
        networkPassphrase: NETWORK_PASSPHRASE,
    })
    .addOperation(Operation.uploadContractWasm({ wasm }))
    .setTimeout(30)
    .build();

    // Simulate to fetch Soroban footprints & ledger resource fees
    console.log('🔬 Simulating upload transaction resources...');
    uploadTx = await rpc.prepareTransaction(uploadTx);
    uploadTx.sign(keypair);

    console.log('📨 Sending upload transaction...');
    let response = await rpc.sendTransaction(uploadTx);
    
    if (response.status === 'ERROR') {
        throw new Error(`Upload submission failed: ${JSON.stringify(response.errorResultXdr)}`);
    }

    let result = await waitForConfirmation(rpc, response.hash);
    
    // Parse the 32-byte Wasm Hash from the transaction result meta XDR
    const wasmHash = SorobanRpc.parseResultXdr(result.resultXdr);
    console.log(`✅ WASM uploaded successfully! Hash: ${wasmHash.toString('hex')}`);

    // --- PHASE 2: INSTANTIATE CONTRACT ---
    console.log('🏗️ Preparing instance creation transaction...');
    account = await rpc.getAccount(publicKey); // Refresh sequence number

    let createTx = new TransactionBuilder(account, {
        fee: '100000',
        networkPassphrase: NETWORK_PASSPHRASE,
    })
    .addOperation(Operation.createContract({ wasmHash }))
    .setTimeout(30)
    .build();

    console.log('🔬 Simulating creation transaction resources...');
    createTx = await rpc.prepareTransaction(createTx);
    createTx.sign(keypair);

    console.log('📨 Sending creation transaction...');
    response = await rpc.sendTransaction(createTx);
    
    if (response.status === 'ERROR') {
        throw new Error(`Creation submission failed: ${JSON.stringify(response.errorResultXdr)}`);
    }

    result = await waitForConfirmation(rpc, response.hash);
    
    // Convert returned xdr address payload into standard printable "C..." Soroban contract string
    const contractIdXdr = SorobanRpc.parseResultXdr(result.resultXdr);
    const contractId = asAddress(contractIdXdr).toString();

    console.log('\n🎉 Deployment Complete!');
    console.log(`📝 Contract ID: ${contractId}`);
    console.log(`🔗 Transaction hash: ${result.hash}`);
}

async function waitForConfirmation(rpc, hash) {
    console.log('⏳ Waiting for ledger confirmation...');
    let result = await rpc.getTransaction(hash);
    while (result.status === 'PENDING') {
        await new Promise(resolve => setTimeout(resolve, 1500));
        result = await rpc.getTransaction(hash);
    }

    if (result.status !== 'SUCCESS') {
        throw new Error(`Transaction failed tracking state: ${JSON.stringify(result)}`);
    }
    return result;
}

deployVerifier().catch(console.error);
