const fs = require("fs");
const loader = require(__dirname + "/node_modules/assemblyscript/lib/loader");

const compiled = new WebAssembly.Module(fs.readFileSync(__dirname + "/build/untouched.wasm"));

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

const instance = loader.instantiateSync(compiled, imports);

console.log("Output for add(5, 2144) from WASM:", instance.add(5, 2144));
