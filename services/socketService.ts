import io from "socket.io-client";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const SOCKET_URL = Constants.expoConfig?.extra?.socketUrl || "";

class SocketService {
  private socket: ReturnType<typeof io> | null = null;
  private isConnected: boolean = false;
  private emitQueue: Array<{ event: string; data: any }> = [];
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
    if (this.socket?.connected || this.isConnected) {
      // console.log("Already connected to socket...");
      return;
    }

    const token = await SecureStore.getItemAsync("accessToken");

    // If we already have a socket instance, update auth and attempt to connect
    if (this.socket) {
      // update auth for reconnection
      // @ts-ignore -- socket.io-client types don't always expose auth
      this.socket.auth = { token: token ? token : undefined };
      this.socket.connect();
      return;
    }

    // console.log("Creating new socket connection...");

    this.socket = io(SOCKET_URL, {
      path: Constants.expoConfig?.extra?.socketPath || "",
      auth: {
        token: token ? token : undefined,
      },
      transports: ["websocket"],
      // Let socket.io manage reconnection
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      // console.log("Socket connected");
      this.isConnected = true;
      // flush queued emits
      while (this.emitQueue.length && this.socket) {
        const { event, data } = this.emitQueue.shift()!;
        this.socket.emit(event, data);
      }
    });

    // reason is a string like "io client disconnect"
    this.socket.on("disconnect", (reason: string) => {
      console.log("Socket disconnected:", reason);
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error: any) => {
      console.error("Socket connection error:", error);
      // rely on socket.io's built-in reconnection
    });

    this.socket.on("error", (error: any) => {
      console.error("Socket error:", error);
    });
  }

  // manual reconnection removed in favor of socket.io reconnection

  joinChat(chatId: string): void {
    console.log("Joining chat:", chatId);
    this.emitEvent("join_chats", [chatId]);
  }

  leaveChat(chatId: string): void {
    this.emitEvent("leave_chats", [chatId]);
  }

  onEvent<T>(event: string, callback: (data: T) => void): void {
    this.socket?.on(event, callback);
  }

  offEvent(event: string, callback?: (data: any) => void): void {
    this.socket?.off(event, callback);
  }

  emitEvent(event: string, data: any): void {
    if (this.isConnected && this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn("Socket not connected, queuing event:", event);
      this.emitQueue.push({ event, data });
      // try to connect if not already
      this.connect().catch(() => {
        /* connect errors are logged by socket handlers */
      });
    }
  }
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      // console.log("Socket disconnected manually");
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const socketService = SocketService.getInstance();
