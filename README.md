# SimplEE - A Simple Ethereum WASM EE Framework

## Major Components
- **EE Module Library**
    - Located at [`simplee/assembly/index.ts`](https://github.com/adiasg/simplEE/blob/master/assembly/index.ts)
    - Written in AssemblyScript
    - The module library must provide a basic [Ethereum Environment Interface](https://github.com/ewasm/design/blob/master/eth_interface.md)
- **Host Program**
    - Located at [`simplee/run.js`](https://github.com/adiasg/simplEE/blob/master/run.js)
    - Written in:
        - NodeJS for CLI
        - Browser-side JS for UI
- **State Provider Server**
    - Located at [`simplee-sp`](https://github.com/dangerousfood/simplee-sp)
    - Written in NodeJS
    - The state provider server is responsible for providing the latest EE state, the latest Ethereum state root, and the corresponding witness to Ethereum client and block producers. For simplicity in this demonstration, the block producer & state provider server can be the same

## EE Module Library
- Basic EEI functions to perform:
    - Load `pre_state`
        - To avoid defining a state merkle-ization scheme for the EE state, `pre_state` can contain `ee_state` and `state_root`, with `state_root = HASH(ee_state)` or similar
    - Verify a provided `ee_state` against the current `state_root`
    - Output `post_state`
        - Similar to `pre_state`, `post_state` can contain `ee_state` and `state_root` with `state_root = HASH(ee_state)`

## Host Program
- WASM code cannot run on its own without a system interface. We'll be spinning up WASM instances through JS. Tools like WASI exist, but the JS interface to WASM is easy to use & makes client functionality easy to implement.
- Passing data into and out of the WASM instance is done by accessing the memory of the instance. While this is very simple for basic data types, it becomes tedious for complex data types, the ugliest being user-defined types/classes. Specifically for array types, the [AssemblyScript Loader](https://github.com/AssemblyScript/assemblyscript/tree/master/lib/loader) makes the job easier.
- All functionalities that involve JS passing data into WASM must be implemented inside WASM functions that are exported to JS, and then those functions are called from JS.

## State Provider Server
- State provider & block producer can be bundled into one server for now
- The workflow for user transactions is:
    - Fetch current state from the state provider
    - Create & submit a transaction to the block producer
    - The transactions is put into a new block if the state & witness data is fresh (valid)
- To simplify further, the block producer creates a new block for each user transaction



## ETHDenver Demonstration
- The dev tools, i.e., AssemblyScript EE modules & the host program is the main product of the hackathon
- A sample implementation of an ETH transfer EE can be made using the framework. It can be given a very simple browser UI that uses browser-side JS as the host program.
