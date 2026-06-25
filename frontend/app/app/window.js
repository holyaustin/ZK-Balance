// app/window.js
import { Buffer } from "buffer";

if (typeof window !== "undefined") {
  window.Buffer = Buffer;
} else {
  globalThis.Buffer = Buffer;
  globalThis.window = {};
}
export default globalThis;
