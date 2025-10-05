import io, { Socket } from "socket.io-client";
import * as SecureStore from "expo-secure-store";

// const SOCKET_URL =
//   process.env.NODE_ENV === "production"
//     ? process.env.EXPO_PUBLIC_SOCKET_URL
//     : "https://companiescenterllc.com";

const SOCKET_URL = "https://companiescenterllc.com";

class SocketService {
  private socket: typeof Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private static instance: SocketService;
  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }
  async connect(): Promise<void> {
    // console.log("Attempting to connect to socket...");
    if (this.socket?.connected || this.isConnected) return;

    const token = await SecureStore.getItemAsync("accessToken");

    this.socket = io(`${SOCKET_URL}/chat`, {
      path: "/sanuxsocket/socket.io",
      auth: {
        token: token ? token : undefined,
      },
      transports: ["websocket"],
      forceNew: true,
    });
    // console.log("Socket instance created:", this.socket);
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Socket connected");
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason: typeof Socket.disconnected) => {
      console.log("Socket disconnected:", reason);
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error: any) => {
      console.error("Socket connection error:", error);
      this.handleReconnection();
    });

    this.socket.on("error", (error: any) => {
      console.error("Socket error:", error);
    });
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect();
      }, 1000 * this.reconnectAttempts); // Exponential backoff
    }
  }

  joinChat(chatId: string): void {
    this.socket?.emit("join_chats", [chatId]);
  }

  leaveChat(chatId: string): void {
    this.socket?.emit("leave_chat", chatId);
  }

  onEvent<T>(event: string, callback: (data: T) => void): void {
    this.socket?.on(event, callback);
  }

  offEvent(event: string, callback?: (data: any) => void): void {
    this.socket?.off(event, callback);
  }

  emitEvent(event: string, data: any): void {
    if (this.isConnected) {
      this.socket?.emit(event, data);
    } else {
      console.warn("Socket not connected, cannot emit event:", event);
    }
  }
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
      console.log("Socket disconnected manually");
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const socketService = SocketService.getInstance();
