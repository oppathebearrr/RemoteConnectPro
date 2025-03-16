// Polyfills for browser compatibility with Node.js modules like SimplePeer
import { Buffer as BufferPolyfill } from 'buffer';

// Polyfill for global variable needed by SimplePeer
if (typeof window !== 'undefined') {
  // Set global object
  if (!window.global) {
    (window as any).global = window;
  }

  // Set process object
  if (!window.process) {
    (window as any).process = {
      env: { DEBUG: undefined },
      nextTick: (callback: Function, ...args: any[]) => setTimeout(() => callback(...args), 0),
      version: ''
    };
  }

  // Set Buffer object using the imported polyfill
  if (!window.Buffer) {
    (window as any).Buffer = BufferPolyfill;
  }
}

export default {};