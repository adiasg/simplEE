(async () => {
  const $ = require('jquery');

  const loader = require("../../node_modules/assemblyscript/lib/loader");

  //// Initialize the imports that the WASM module expects: memory, table, and any JS functions
  //// For importing memory and table, use the "--importMemory" and "--ImportTable" flags with asc (AssemblyScript compiler)
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

  //// Instantiate the WASM module
  const instance = await loader.instantiateStreaming(
    fetch("untouched.wasm"),
    imports
  )

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

  let pre_state_ptr = instance.getPreState();
  let pre_state = new WASMState(instance, pre_state_ptr);

  let post_state_ptr = instance.getPostState();
  let post_state = new WASMState(instance, post_state_ptr);

  let working_state_ptr = instance.getWorkingState();
  let working_state = new WASMState(instance, working_state_ptr);

  $('#xfer-btn').click( (e) => {
    const res = instance.transfer(3, 0, 1);
    if (res == 1) {
      console.log("After transfer(3, 0, 1)")
      console.log("working_state.ee_state:", working_state.ee_state)
      console.log("working_state.state_root:", working_state.state_root[0].toString(16))
      console.log("")
    } else {
      console.log("Attempted transfer(3, 0, 1) but failed!");
    }
  });

  console.log("Pre-State Data:")
  for (let i=0; i<5; i++) {
    pre_state.ee_state[i] = i;
  }
  instance.updateRoot(pre_state.ptr);
  console.log("pre_state.ee_state:", pre_state.ee_state)
  console.log("pre_state.state_root:", pre_state.state_root[0].toString(16))
  console.log("")

  console.log("After setUp:")
  instance.setUp(working_state.ptr)
  console.log("working_state.ee_state:", working_state.ee_state)
  console.log("working_state.state_root:", working_state.state_root[0].toString(16))
  console.log("")
})();
