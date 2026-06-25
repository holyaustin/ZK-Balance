// scripts/test-verifier.js
const { 
    Contract, 
    SorobanRpc, 
    TransactionBuilder, 
    Networks, 
    nativeToScVal,
    scValToNative
} = require('@stellar/stellar-sdk');

// Configuration
const RPC_URL = 'https://rpc-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;
const CONTRACT_ID = process.env.CONTRACT_ID;

async function testVerifier() {
    console.log('🧪 Testing verifier contract simulation...');
    
    if (!CONTRACT_ID) {
        throw new Error('Environment context validation failed: Missing CONTRACT_ID.');
    }

    const rpc = new SorobanRpc.Server(RPC_URL);
    const contract = new Contract(CONTRACT_ID);
    
    // Allocate raw typed node binary byte sequences matching smart contract constraints
    const a = Buffer.alloc(64);
    const b = Buffer.alloc(128);
    const c = Buffer.alloc(64);
    const threshold = BigInt(100);
    const isValid = BigInt(1);
    
    // Convert primitive arguments to valid structural XDR types using nativeToScVal
    const args = [
        nativeToScVal(a, { type: 'bytes' }),
        nativeToScVal(b, { type: 'bytes' }),
        nativeToScVal(c, { type: 'bytes' }),
        nativeToScVal(threshold, { type: 'u256' }),
        nativeToScVal(isValid, { type: 'u256' }),
    ];
    
    // Fetch a mock source account layout to establish a valid simulation transaction container
    // We can use a dummy placeholder public key since simulation doesn't check signatures
    const dummyPublicKey = 'GDRY3J6Z6G5G6G5G6G5G6G5G6G5G6G5G6G5G6G5G6G5G6G5G6G5G6G5G';
    const account = await rpc.getAccount(dummyPublicKey);

    const tx = new TransactionBuilder(account, {
        fee: '100000',
        networkPassphrase: NETWORK_PASSPHRASE,
    })
    .addOperation(contract.call('verify_balance', ...args))
    .setTimeout(30)
    .build();

    // Trigger direct dry-run simulation against node execution environments
    console.log('🔬 Invoking dry-run ledger simulation pipeline...');
    const result = await rpc.simulateTransaction(tx);
    
    if (SorobanRpc.isSimulationSuccess(result)) {
        const returnValueXdr = result.result.retval;
        const decodedResult = scValToNative(returnValueXdr);
        console.log(`\n✅ Simulation Executed Successfully!`);
        console.log(`📝 Smart Contract Returned Value:`, decodedResult);
    } else {
        console.log(`\n❌ Simulation Failed / Rejected by VM:`);
        console.log(JSON.stringify(result, null, 2));
    }
}

testVerifier().catch(console.error);
