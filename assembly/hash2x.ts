import { HASH } from "util/hash";

const FNV_OFFSET: u32 = 2166136261;
const FNV_PRIME: u32 = 16777619;

// Modified hash64() from util/hash.ts to take in 2x u32 inputs
export function hash2x(h: u32, l: u32): u32 {
  var v = FNV_OFFSET;
  v = (v ^ ( l        & 0xff)) * FNV_PRIME;
  v = (v ^ ((l >>  8) & 0xff)) * FNV_PRIME;
  v = (v ^ ((l >> 16) & 0xff)) * FNV_PRIME;
  v = (v ^ ( l >> 24        )) * FNV_PRIME;
  v = (v ^ ( h        & 0xff)) * FNV_PRIME;
  v = (v ^ ((h >>  8) & 0xff)) * FNV_PRIME;
  v = (v ^ ((h >> 16) & 0xff)) * FNV_PRIME;
  v = (v ^ ( h >> 24        )) * FNV_PRIME;
  return v;
}
