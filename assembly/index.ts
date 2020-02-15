// The entry file of your WebAssembly module.
/*
This EE maintains the balances of 5 user accounts, indexed from 0 to 4
It supports a single function `transfer` to transfer balances between accounts, and inputs the sender account index, receiver account index, and transfer amount.
*/

import {
  hash2x
} from './hash2x.ts'

// -----------------
export class State {
  // ee_state maintains the balances of the 5 user accounts
  ee_state: Array<u32> = new Array<u32>(5);
  // state_root is the hash of ee_state
  state_root: Array<u32> = new Array<u32>(1);

  constructor() {
    // Set ee_state to all zeros and calculate corresponding state_root
    for (let i=0; i<this.ee_state.length; i++) {
      this.ee_state[i] = 0;
    }
    this.calc_state_root()
  }

  hash_ee_state(): u32 {
    // Returns hash of the ee_state array
    let h: u32 = hash2x(this.ee_state[0], this.ee_state[1]);
    for (let i=2; i<this.ee_state.length; i++) {
      h = hash2x(h, this.ee_state[i]);
    }
    return h;
  }

  calc_state_root(): void {
    // Sets state_root to the hash of ee_state
    this.state_root[0] = this.hash_ee_state();
  }

  balance(account: i32): u32 {
    // Returns the balance of the corresponding account
    return this.ee_state[account];
  }

}
// -----------------


// -----------------
// pre_state holds the pre-state of the block
const pre_state = new State();
// post_state holds the post-state of the block
const post_state = new State();
// working_state is the temporary state variable while we process transactions
const working_state = new State();
// -----------------


// -----------------
// Export the variables to JS using functions
export function getPreState(): State {
  return pre_state;
}

export function getPostState(): State {
  return post_state;
}

export function getWorkingState(): State {
  return working_state;
}
// -----------------


export function setUp(working_state: State): void {
  // setUp functions that copies pre_state into working_state
  for (let i=0; i<working_state.ee_state.length; i++) {
    working_state.ee_state[i] = pre_state.ee_state[i];
  }
  working_state.calc_state_root();
}

export function updateRoot(state: State): void {
  state.calc_state_root();
}
// -----------------


// -----------------
export function transfer(sender: i32, receiver: i32, amount: u32): i32 {
  if (sender<5 && receiver<5 && amount>0) {
    if (working_state.balance(sender)<=amount) {
      return -1;
    }
    working_state.ee_state[sender] -= amount;
    working_state.ee_state[receiver] += amount;
    return 1;
  }
  return -2;
}
// -----------------

export { hash2x };
export const STATE_ID = idof<State>();
export const STATE_SIZE = sizeof<State>();
export const STATE_EE_STATE_OFFSET = offsetof<State>("ee_state");
export const STATE_STATE_ROOT_OFFSET = offsetof<State>("state_root");
