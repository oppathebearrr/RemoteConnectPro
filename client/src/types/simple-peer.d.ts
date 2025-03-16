declare module 'simple-peer' {
  interface SimplePeerOptions {
    initiator?: boolean;
    trickle?: boolean;
    stream?: MediaStream;
    config?: RTCConfiguration;
  }
  
  interface Instance {
    signal(data: unknown): void;
    on(event: string, callback: Function): void;
    destroy(): void;
    send(data: string | Blob | ArrayBuffer | ArrayBufferView): void;
    connected: boolean;
  }
  
  function SimplePeer(options: SimplePeerOptions): Instance;
  export = SimplePeer;
}