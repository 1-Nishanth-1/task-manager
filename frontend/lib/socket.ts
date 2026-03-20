import { io, Socket } from "socket.io-client";
import { getBackendToken } from "./backendToken";

let socket: Socket | null = null;

export async function getSocket(): Promise<Socket> {
  if (socket) return socket;

  const url =
    process.env.NEXT_PUBLIC_SOCKET_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000";

  const token = await getBackendToken();

  socket = io(url, {
    auth: token ? { token } : undefined,
    withCredentials: true,
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
