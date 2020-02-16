// Standard imports
const fs = require("fs");
const loader = require(__dirname + "/node_modules/assemblyscript/lib/loader");
const fetch = require("node-fetch");

// Read & re-compile the WASM module
const compiled = new WebAssembly.Module(fs.readFileSync(__dirname + "/build/untouched.wasm"));

// Initialize the imports that the WASM module expects: memory, table, and any JS functions
// For importing memory and table, use the "--importMemory" and "--ImportTable" flags with asc (AssemblyScript compiler)
const wasm_memory = new WebAssembly.Memory({initial: 1});
const wasm_table = new WebAssembly.Table({initial: 50, element:"anyfunc"});
const imports = {
  env: {
    abort(_msg, _file, line, column) {
       console.error("abort called at index.ts:" + line + ":" + column);
    },
    memory: wasm_memory,
    table: wasm_table
  }
};

// Instantiate the WASM module
const instance = loader.instantiateSync(compiled, imports);
const SP_SERVER = "http://localhost:3000";

/*-------------------------------------------------------------------------------------------------------------*/

function list2wasmArray(list, wasmArrayView) {
  for (let i=0; i<list.length; i++) {
    wasmArrayView[i] = list[i];
  }
}

function array2list(array) {
  let l = [];
  for (let i=0; i<array.length; i++) {
    l[l.length] = array[i];
  }
  return l;
}

class State {
  /*
  State contains the following:

  - state_root: Int32Array(1)
    This is the hash of the ee_state array

  - ee_state: Int32Array(5)
    This EE maintains the balances of 5 accounts, which are stored in this array
  */
  constructor(state_root, ee_state) {
    this.state_root = state_root;
    this.ee_state = ee_state;
  }
}

class WASMState extends State {
  constructor(instance, ptr) {
    let memory_array = new Int32Array(instance.memory.buffer);

    // Fetch the object's internal variables using memory offsets from the base pointer
    // https://github.com/AssemblyScript/assemblyscript/tree/master/lib/loader

    // state_root is WASM Array<u32>(1) / JS Int32Array(1)
    let state_root = instance.__getArrayView(memory_array[ptr + instance.STATE_STATE_ROOT_OFFSET >>> 2]);
    // ee_state is Array<u32>(5) / JS Int32Array(5)
    let ee_state = instance.__getArrayView(memory_array[ptr + instance.STATE_EE_STATE_OFFSET >>> 2]);
    super(state_root, ee_state);

    // Store the WASM pointer to the WASM state object
    this.ptr = ptr;
  }
}

/*-------------------------------------------------------------------------------------------------------------*/
console.log("****** DEMO 1: Local WASM EE Execution ******");
console.log("");

let pre_state_ptr = instance.getPreState();
let pre_state = new WASMState(instance, pre_state_ptr);

let post_state_ptr = instance.getPostState();
let post_state = new WASMState(instance, post_state_ptr);

let working_state_ptr = instance.getWorkingState();
let working_state = new WASMState(instance, working_state_ptr);

console.log("[*] Writing pre_state into WASM memory")
for (let i=0; i<5; i++) {
  pre_state.ee_state[i] = i;
}
instance.updateRoot(pre_state.ptr);
console.log("\tpre_state.ee_state:", pre_state.ee_state);
console.log("\tpre_state.state_root:", pre_state.state_root[0].toString(16));
console.log("");

console.log("[*] Calling WASM setUp() function")
instance.setUp(working_state.ptr);
console.log("\tworking_state.ee_state:", working_state.ee_state);
console.log("\tworking_state.state_root:", working_state.state_root[0].toString(16));
console.log("");

console.log("[*] Executing transaction `transfer(3, 0, 2)`");
instance.transfer(3, 0, 2);
console.log("\tworking_state.ee_state:", working_state.ee_state);
console.log("\tworking_state.state_root:", working_state.state_root[0].toString(16));
console.log("");

console.log("[*] Calling WASM cleanUp() function")
instance.cleanUp(working_state.ptr);
console.log("\tpost_state.ee_state:", post_state.ee_state);
console.log("\tpost_state.state_root:", post_state.state_root[0].toString(16));

console.log("");
console.log("");
/*-------------------------------------------------------------------------------------------------------------*/

function verifyBlock(instance, block) {
  let pre_state_ptr = instance.getPreState();
  let pre_state = new WASMState(instance, pre_state_ptr);

  list2wasmArray(block['pre']['ee_state'], pre_state.ee_state);
  list2wasmArray(block['pre']['state_root'], pre_state.state_root);
  // console.log("pre_state.ee_state:", pre_state.ee_state);
  // console.log("pre_state.state_root:", pre_state.state_root[0].toString(16));

  instance.updateRoot(pre_state.ptr);
  instance.setUp();

  for (let i=0; i<block['transactions'].length; i++) {
    let tx = block['transactions'][i];
    console.log("tx:", tx);
    instance.transfer(tx[0], tx[1], tx[2]);
  }

  instance.cleanUp();

  let post_state_ptr = instance.getPostState();
  let post_state = new WASMState(instance, post_state_ptr);
  // console.log("post_state.ee_state:", post_state.ee_state);
  // console.log("post_state.state_root:", post_state.state_root[0].toString(16));

  return post_state.state_root==parseInt(block['post']['state_root'], 16);
}

function createBlock(instance, pre_state_tx_input) {
  let pre_state_ptr = instance.getPreState();
  let pre_state = new WASMState(instance, pre_state_ptr);

  list2wasmArray(pre_state_tx_input['pre']['ee_state'], pre_state.ee_state);
  list2wasmArray(pre_state_tx_input['pre']['state_root'], pre_state.state_root);
  // console.log("pre_state.ee_state:", pre_state.ee_state);
  // console.log("pre_state.state_root:", pre_state.state_root[0].toString(16));

  instance.updateRoot(pre_state.ptr);
  instance.setUp();

  for (let i=0; i<pre_state_tx_input['transactions'].length; i++) {
    let tx = pre_state_tx_input['transactions'][i];
    // console.log("tx:", tx);
    instance.transfer(tx[0], tx[1], tx[2]);
  }

  instance.cleanUp();

  let post_state_ptr = instance.getPostState();
  let post_state = new WASMState(instance, post_state_ptr);
  // console.log("post_state.ee_state:", post_state.ee_state);
  // console.log("post_state.state_root:", post_state.state_root[0].toString(16));

  let block = {
    'pre': pre_state_tx_input['pre'],
    'transactions': pre_state_tx_input['transactions'],
    'post': {
      'ee_state': array2list(post_state.ee_state),
      'state_root': post_state.state_root[0].toString(16)
    }
  };

  return block;
}

function createGenesisBlock(instance, pre_state_input) {
  let pre_state_ptr = instance.getPreState();
  let pre_state = new WASMState(instance, pre_state_ptr);

  list2wasmArray(pre_state_input['pre']['ee_state'], pre_state.ee_state);
  // console.log("pre_state.ee_state:", pre_state.ee_state);
  // console.log("pre_state.state_root:", pre_state.state_root[0].toString(16));

  instance.updateRoot(pre_state.ptr);
  instance.setUp();

  instance.cleanUp();

  let post_state_ptr = instance.getPostState();
  let post_state = new WASMState(instance, post_state_ptr);
  // console.log("post_state.ee_state:", post_state.ee_state);
  // console.log("post_state.state_root:", post_state.state_root[0].toString(16));

  let block = {
    'pre': pre_state_input['pre'],
    'post': {
      'ee_state': array2list(post_state.ee_state),
      'state_root': post_state.state_root[0].toString(16)
    }
  };

  return block;
}

let genesis_state = { pre: { ee_state: [ 100, 42, 26, 18, 230 ] } };
let genesis_block = createGenesisBlock(instance, genesis_state);

// console.log("Genesis Block:");
// console.log(genesis_block);
// console.log("");

function printChain(chaindata) {
  for (let i=0; i<chaindata.length; i++) {
    console.log("Block", i);
    console.log(chaindata[i]);
  }
}

async function postGenesisBlock() {
  console.log("");
  console.log("[*] Posting the genesis block to the SP")
  let response = await fetch(SP_SERVER+"/updateLatestBlock", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(genesis_block)
  });
  console.log("The latest chain is updated to:");
  printChain(JSON.parse(await response.json()));
}

async function getLatestBlock() {
  console.log("[*] Fetching the latest block from the SP")
  let latest_block = await fetch(SP_SERVER+"/getLatestBlock", {
    method: 'GET'
  });
  console.log("The latest block is:");
  let latest_block_data = await latest_block.json();
  console.log(latest_block_data);
  return latest_block_data;
}

async function makeNextBlock(txs) {
  let latest_block = await getLatestBlock();

  console.log("");
  console.log("[*] Posting the next block to the SP")
  // console.log(await latest_block);

  let next_block_input = {'pre': latest_block['post'], 'transactions': txs};
  let next_block = createBlock(instance, next_block_input);
  // console.log("next_block:", next_block);

  let current_chain = await fetch(SP_SERVER+"/updateLatestBlock", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(next_block)
  });
  console.log("The latest chain is updated to:");
  printChain(JSON.parse(await current_chain.json()));
}

/*-------------------------------------------------------------------------------------------------------------*/
console.log("****** DEMO 2: Executing & Verifying Blocks From SP ******");
console.log("");

postGenesisBlock().then(() => makeNextBlock([[3, 0 ,1]])).then(() => makeNextBlock([[1, 4 ,18]]));
