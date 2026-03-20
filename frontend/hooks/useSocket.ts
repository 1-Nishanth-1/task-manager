"use client";

import { useEffect } from "react";
import type { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";

export type SocketEventHandler<TPayload = unknown> = {
  event: string;
  handler: (socket: Socket, payload: TPayload) => void;
};

export function useSocket(
  handlers: SocketEventHandler[],
  deps: unknown[] = [],
) {
  useEffect(() => {
    let isSubscribed = true;
    let currentSocket: Socket | null = null;
    let entries: { event: string; wrapped: (payload: unknown) => void }[] = [];

    getSocket().then((socket) => {
      if (!isSubscribed) return;
      currentSocket = socket;

      entries = handlers.map(({ event, handler }) => {
        const wrapped = (payload: unknown) => handler(socket, payload as any);
        socket.on(event, wrapped);
        return { event, wrapped } as const;
      });
    });

    return () => {
      isSubscribed = false;
      if (currentSocket) {
        entries.forEach(({ event, wrapped }) => {
          currentSocket!.off(event, wrapped);
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
