(()=>{var t={263:(t,r)=>{"use strict";const e="undefined"!=typeof BigUint64Array,n=Symbol();function a(t,r){const e=new Uint32Array(t),n=new Uint16Array(t);var a=e[r+-4>>>2]>>>1,o=r>>>1;if(a<=1024)return String.fromCharCode.apply(String,n.subarray(o,o+a));const i=[];do{const t=n[o+1024-1],r=t>=55296&&t<56320?1023:1024;i.push(String.fromCharCode.apply(String,n.subarray(o,o+=r))),a-=r}while(a>1024);return i.join("")+String.fromCharCode.apply(String,n.subarray(o,o+a))}function o(t){const r={};function e(t,r){return t?a(t.buffer,r):"<yet unknown>"}const n=t.env=t.env||{};return n.abort=n.abort||function(t,a,o,i){const s=r.memory||n.memory;throw Error("abort: "+e(s,t)+" at "+e(s,a)+":"+o+":"+i)},n.trace=n.trace||function(t,a){const o=r.memory||n.memory;console.log("trace: "+e(o,t)+(a?" ":"")+Array.prototype.slice.call(arguments,2,2+a).join(", "))},t.Math=t.Math||Math,t.Date=t.Date||Date,r}function i(t,r){const n=r.exports,o=n.memory,i=n.table,s=n.__alloc,l=n.__retain,c=n.__rtti_base||-1;function y(t){const r=new Uint32Array(o.buffer);if((t>>>=0)>=r[c>>>2])throw Error("invalid id: "+t);return r[(c+4>>>2)+2*t]}function f(t){const r=new Uint32Array(o.buffer);if((t>>>=0)>=r[c>>>2])throw Error("invalid id: "+t);return r[(c+4>>>2)+2*t+1]}function g(t){return 31-Math.clz32(t>>>5&31)}function _(t,r,e){const n=o.buffer;if(e)switch(t){case 2:return new Float32Array(n);case 3:return new Float64Array(n)}else switch(t){case 0:return new(r?Int8Array:Uint8Array)(n);case 1:return new(r?Int16Array:Uint16Array)(n);case 2:return new(r?Int32Array:Uint32Array)(n);case 3:return new(r?BigInt64Array:BigUint64Array)(n)}throw Error("unsupported align: "+t)}function A(t){const r=new Uint32Array(o.buffer),e=r[t+-8>>>2],n=y(e);if(!(1&n))throw Error("not an array: "+e);const a=g(n);var i=r[t+4>>>2];const s=2&n?r[t+12>>>2]:r[i+-4>>>2]>>>a;return _(a,1024&n,2048&n).subarray(i>>>=a,i+s)}function b(t,r,e){return new t(w(t,r,e))}function w(t,r,e){const n=o.buffer,a=new Uint32Array(n),i=a[e+4>>>2];return new t(n,i,a[i+-4>>>2]>>>r)}return t.__allocString=function(t){const r=t.length,e=s(r<<1,1),n=new Uint16Array(o.buffer);for(var a=0,i=e>>>1;a<r;++a)n[i+a]=t.charCodeAt(a);return e},t.__getString=function(t){const r=o.buffer;if(1!==new Uint32Array(r)[t+-8>>>2])throw Error("not a string: "+t);return a(r,t)},t.__allocArray=function(t,r){const e=y(t);if(!(3&e))throw Error("not an array: "+t+" @ "+e);const n=g(e),a=r.length,i=s(a<<n,0),c=s(2&e?16:12,t),u=new Uint32Array(o.buffer);u[c+0>>>2]=l(i),u[c+4>>>2]=i,u[c+8>>>2]=a<<n,2&e&&(u[c+12>>>2]=a);const f=_(n,1024&e,2048&e);if(8192&e)for(let t=0;t<a;++t)f[(i>>>n)+t]=l(r[t]);else f.set(r,i>>>n);return c},t.__getArrayView=A,t.__getArray=function(t){const r=A(t),e=r.length,n=new Array(e);for(let t=0;t<e;t++)n[t]=r[t];return n},t.__getArrayBuffer=function(t){const r=o.buffer,e=new Uint32Array(r)[t+-4>>>2];return r.slice(t,t+e)},t.__getInt8Array=b.bind(null,Int8Array,0),t.__getInt8ArrayView=w.bind(null,Int8Array,0),t.__getUint8Array=b.bind(null,Uint8Array,0),t.__getUint8ArrayView=w.bind(null,Uint8Array,0),t.__getUint8ClampedArray=b.bind(null,Uint8ClampedArray,0),t.__getUint8ClampedArrayView=w.bind(null,Uint8ClampedArray,0),t.__getInt16Array=b.bind(null,Int16Array,1),t.__getInt16ArrayView=w.bind(null,Int16Array,1),t.__getUint16Array=b.bind(null,Uint16Array,1),t.__getUint16ArrayView=w.bind(null,Uint16Array,1),t.__getInt32Array=b.bind(null,Int32Array,2),t.__getInt32ArrayView=w.bind(null,Int32Array,2),t.__getUint32Array=b.bind(null,Uint32Array,2),t.__getUint32ArrayView=w.bind(null,Uint32Array,2),e&&(t.__getInt64Array=b.bind(null,BigInt64Array,3),t.__getInt64ArrayView=w.bind(null,BigInt64Array,3),t.__getUint64Array=b.bind(null,BigUint64Array,3),t.__getUint64ArrayView=w.bind(null,BigUint64Array,3)),t.__getFloat32Array=b.bind(null,Float32Array,2),t.__getFloat32ArrayView=w.bind(null,Float32Array,2),t.__getFloat64Array=b.bind(null,Float64Array,3),t.__getFloat64ArrayView=w.bind(null,Float64Array,3),t.__instanceof=function(t,r){const e=new Uint32Array(o.buffer);var n=e[t+-8>>>2];if(n<=e[c>>>2])do{if(n==r)return!0}while(n=f(n));return!1},t.memory=t.memory||o,t.table=t.table||i,u(n,t)}function s(t){return"undefined"!=typeof Response&&t instanceof Response}async function l(t,r){return s(t=await t)?c(t,r):i(o(r||(r={})),await WebAssembly.instantiate(t instanceof WebAssembly.Module?t:await WebAssembly.compile(t),r))}async function c(t,r){return WebAssembly.instantiateStreaming?i(o(r||(r={})),(await WebAssembly.instantiateStreaming(t,r)).instance):l(s(t=await t)?t.arrayBuffer():t,r)}function u(t,r){var e=r?Object.create(r):{},a=t.__argumentsLength?function(r){t.__argumentsLength.value=r}:t.__setArgumentsLength||t.__setargc||function(){};for(let r in t){if(!Object.prototype.hasOwnProperty.call(t,r))continue;const o=t[r];let i=r.split("."),s=e;for(;i.length>1;){let t=i.shift();Object.prototype.hasOwnProperty.call(s,t)||(s[t]={}),s=s[t]}let l=i[0],c=l.indexOf("#");if(c>=0){let e=l.substring(0,c),i=s[e];if(void 0===i||!i.prototype){let t=function(...r){return t.wrap(t.prototype.constructor(0,...r))};t.prototype={valueOf:function(){return this[n]}},t.wrap=function(r){return Object.create(t.prototype,{[n]:{value:r,writable:!1}})},i&&Object.getOwnPropertyNames(i).forEach(r=>Object.defineProperty(t,r,Object.getOwnPropertyDescriptor(i,r))),s[e]=t}if(l=l.substring(c+1),s=s[e].prototype,/^(get|set):/.test(l)){if(!Object.prototype.hasOwnProperty.call(s,l=l.substring(4))){let e=t[r.replace("set:","get:")],a=t[r.replace("get:","set:")];Object.defineProperty(s,l,{get:function(){return e(this[n])},set:function(t){a(this[n],t)},enumerable:!0})}}else"constructor"===l?(s[l]=(...t)=>(a(t.length),o(...t))).original=o:(s[l]=function(...t){return a(t.length),o(this[n],...t)}).original=o}else/^(get|set):/.test(l)?Object.prototype.hasOwnProperty.call(s,l=l.substring(4))||Object.defineProperty(s,l,{get:t[r.replace("set:","get:")],set:t[r.replace("get:","set:")],enumerable:!0}):"function"==typeof o&&o!==a?(s[l]=(...t)=>(a(t.length),o(...t))).original=o:s[l]=o}return e}r.instantiate=l,r.instantiateSync=function(t,r){return i(o(r||(r={})),new WebAssembly.Instance(t instanceof WebAssembly.Module?t:new WebAssembly.Module(t),r))},r.instantiateStreaming=c,r.demangle=u},609:t=>{"use strict";t.exports=jQuery}},r={};function e(n){if(r[n])return r[n].exports;var a=r[n]={exports:{}};return t[n](a,a.exports,e),a.exports}(async()=>{const t=e(609),r=e(263),n={env:{abort(t,r,e,n){console.error("abort called at index.ts:"+e+":"+n)},memory:new WebAssembly.Memory({initial:1}),table:new WebAssembly.Table({initial:50,element:"anyfunc"})}},a=await r.instantiateStreaming(fetch("untouched.wasm"),n);class o extends class{constructor(t,r){this.state_root=t,this.ee_state=r}}{constructor(t,r){let e=new Int32Array(t.memory.buffer);super(t.__getArrayView(e[r+t.STATE_STATE_ROOT_OFFSET>>>2]),t.__getArrayView(e[r+t.STATE_EE_STATE_OFFSET>>>2])),this.ptr=r}}let i=a.getPreState(),s=new o(a,i),l=a.getPostState(),c=(new o(a,l),a.getWorkingState()),u=new o(a,c);t("#xfer-btn").click(t=>{console.log("After transfer(3, 0, 1)"),console.log(a.transfer(3,0,1)),console.log("working_state.ee_state:",u.ee_state),console.log("working_state.state_root:",u.state_root[0].toString(16)),console.log("")}),console.log("Pre-State Data:");for(let t=0;t<5;t++)s.ee_state[t]=t;a.updateRoot(s.ptr),console.log("pre_state.ee_state:",s.ee_state),console.log("pre_state.state_root:",s.state_root[0].toString(16)),console.log(""),console.log("After setUp:"),a.setUp(u.ptr),console.log("working_state.ee_state:",u.ee_state),console.log("working_state.state_root:",u.state_root[0].toString(16)),console.log("")})()})();