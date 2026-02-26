declare module "ws" {
  // Minimal typings sufficient for current usage
  export class WebSocket {
    constructor(...args: any[]);
    send(data: any): void;
    close(): void;
    on(event: string, listener: (...args: any[]) => void): void;
  }

  export class WebSocketServer {
    constructor(options?: any);
    on(event: "connection", listener: (ws: WebSocket, request?: any) => void): void;
    on(event: string, listener: (...args: any[]) => void): void;
  }
}
