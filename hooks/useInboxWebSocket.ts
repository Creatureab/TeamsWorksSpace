import { useEffect, useRef } from "react";
import { getInboxWsUrl } from "@/lib/utils";

type InboxMessage =
  | { type: "inbox"; workspaceId?: string; count?: number }
  | { type: string; [key: string]: unknown };

interface UseInboxWebSocketOptions {
  email?: string | null;
  workspaceId?: string;
  onCount?: (count: number) => void;
  onMessage?: (message: InboxMessage) => void;
}

/**
 * Small hook to share inbox WebSocket wiring across components.
 * Sends a subscribe message on connect and forwards `inbox` payloads
 * to the provided handlers.
 */
export function useInboxWebSocket({
  email,
  workspaceId,
  onCount,
  onMessage,
}: UseInboxWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = getInboxWsUrl();
    if (!wsUrl || !email) return;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.addEventListener("open", () => {
      ws.send(
        JSON.stringify({
          type: "subscribe",
          email,
          workspaceId,
        })
      );
    });

    ws.addEventListener("message", (event) => {
      try {
        const msg: InboxMessage = JSON.parse(event.data);
        onMessage?.(msg);
        if (msg.type === "inbox" && typeof msg.count === "number") {
          onCount?.(msg.count);
        }
      } catch (err) {
        console.error("WS inbox parse error", err);
      }
    });

    ws.addEventListener("error", () => {
      ws.close();
    });

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [email, workspaceId, onCount, onMessage]);

  return wsRef;
}
