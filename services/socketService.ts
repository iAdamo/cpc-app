import io from "socket.io-client";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import uuid from "react-native-uuid";
import { getDeviceId, getSessionId } from "@/utils/device";
import { EventEnvelope } from "@/types";

export enum SocketEvents {
  // Connection events
  CONNECTION = "connection",
  DISCONNECT = "disconnect",
  RECONNECT = "reconnect",

  // Chat events
  CHAT_SEND_MESSAGE = "chat:send_message",
  CHAT_MESSAGE_SENT = "chat:message_sent",
  CHAT_MESSAGE_DELIVERED = "chat:message_delivered",
  CHAT_MESSAGE_READ = "chat:message_read",
  CHAT_TYPING_START = "chat:typing_start",
  CHAT_TYPING_STOP = "chat:typing_stop",
  CHAT_JOIN_ROOM = "chat:join_room",
  CHAT_LEAVE_ROOM = "chat:leave_room",

  // Notification events
  NOTIFICATION_SEND = "notification:send",
  NOTIFICATION_RECEIVED = "notification:received",
  NOTIFICATION_READ = "notification:read",

  // Presence events
  PRESENCE_UPDATE = "presence:update",
  PRESENCE_ONLINE = "presence:online",
  PRESENCE_OFFLINE = "presence:offline",
  PRESENCE_SUBSCRIBE = "presence:subscribe",

  // System events
  ERROR = "error",
  RATE_LIMIT_EXCEEDED = "rate_limit:exceeded",
}

export enum ChatEvents {
  // Outgoing events
  MESSAGE_SENT = SocketEvents.CHAT_MESSAGE_SENT,
  MESSAGE_DELIVERED = SocketEvents.CHAT_MESSAGE_DELIVERED,
  MESSAGE_READ = SocketEvents.CHAT_MESSAGE_READ,
  TYPING_START = SocketEvents.CHAT_TYPING_START,
  TYPING_STOP = SocketEvents.CHAT_TYPING_STOP,
  USER_JOINED = "chat:user_joined",
  USER_LEFT = "chat:user_left",
  CONVERSATION_UPDATED = "chat:conversation_updated",

  // Incoming events
  SEND_MESSAGE = SocketEvents.CHAT_SEND_MESSAGE,
  JOIN_ROOM = SocketEvents.CHAT_JOIN_ROOM,
  LEAVE_ROOM = SocketEvents.CHAT_LEAVE_ROOM,
  MARK_AS_READ = "chat:mark_as_read",
  TYPING_INDICATOR = "chat:typing_indicator",
}

/**
 * Unified Presence Event System
 */

export enum PresenceEvents {
  UPDATE_STATUS = 'presence:update_status',
  SUBSCRIBE = 'presence:subscribe',
  UNSUBSCRIBE = 'presence:unsubscribe',
  GET_SUBSCRIPTIONS = 'presence:get_subscriptions',
  HEARTBEAT = 'presence:heartbeat',
  USER_ACTIVITY = 'presence:user_activity',
  GET_STATUS = 'presence:get_status',
  GET_BATCH_STATUS = 'presence:get_batch_status',
  STATUS_UPDATED = 'presence:status_updated',
  STATUS_CHANGE = 'presence:status_change', // For subscribed users
  USER_ONLINE = 'presence:user_online',
  USER_OFFLINE = 'presence:user_offline',
  USER_AWAY = 'presence:user_away',
  USER_BUSY = 'presence:user_busy',
  SUBSCRIBED = 'presence:subscribed',
  UNSUBSCRIBED = 'presence:unsubscribed',
  SUBSCRIPTIONS_LIST = 'presence:subscriptions_list',
  STATUS_RESPONSE = 'presence:status_response',
  BATCH_STATUS_RESPONSE = 'presence:batch_status_response',
  PRESENCE_ERROR = 'presence:error',
  HEARTBEAT_ACK = 'presence:heartbeat_ack',
}


const SOCKET_URL = Constants.expoConfig?.extra?.socketUrl || "";

class SocketService {
  private socket: ReturnType<typeof io> | null = null;
  private isConnected: boolean = false;
  private emitQueue: Array<{ event: string; envelope: EventEnvelope }> = [];
  private static instance: SocketService;
  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  // ----------------------------------
  // Connection
  // ----------------------------------
  async connect(): Promise<void> {
    if (this.socket?.connected || this.isConnected) {
      return;
    }

    const token = await SecureStore.getItemAsync("accessToken");

    if (this.socket) {
      // update auth on existing instance
      // @ts-ignore
      this.socket.auth = { token: token || undefined };
      this.socket.connect();
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token: token || undefined },
      transports: ["websocket","polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupEventListeners();
  }

  // ----------------------------------
  // Listener setup
  // ----------------------------------
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on(
      "connection",
      (callback: { status: string; socketId: string; timestamp: Date }) => {
        //  status: 'connected',
        //   socketId: client.id,
        //   timestamp: Date.now(),

        this.isConnected = callback.status === "connected";

        // send queued envelopes
        while (this.emitQueue.length && this.socket) {
          const { event, envelope } = this.emitQueue.shift()!;
          this.socket.emit(event, envelope);
        }
      }
    );

    this.socket.on("disconnect", () => {
      this.isConnected = false;
    });

    this.socket.on("connect_error", (err: any) => {
      console.error("Socket connect error:", err);
    });
  }

  // ----------------------------------
  // EMIT with envelope
  // ----------------------------------
  async emitEvent<T>(
    event: SocketEvents | ChatEvents | PresenceEvents,
    payload: T
  ): Promise<void> {
    const deviceId = await getDeviceId();
    const sessionId = await getSessionId();

    const envelope: EventEnvelope<T> = {
      version: "1.0.0",
      event,
      timestamp: Date.now(),
      payload,
      metadata: {
        requestId: uuid.v4(), // auto-generate requestId
        deviceId: deviceId || undefined,
        sessionId: sessionId || undefined,
      },
    };

    if (this.isConnected && this.socket?.connected) {
      this.socket.emit(event, envelope);
    } else {
      this.emitQueue.push({ event, envelope });
      this.connect().catch(() => {});
    }
  }

  // ----------------------------------
  // LISTEN with envelope
  // ----------------------------------
  onEvent<T>(
    event: SocketEvents | ChatEvents | PresenceEvents,
    callback: (envelope: EventEnvelope<T>) => void
  ): void {
    this.socket?.on(event, callback);
  }

  offEvent(
    event: SocketEvents | ChatEvents | PresenceEvents,
    callback?: (data: any) => void
  ): void {
    this.socket?.off(event, callback);
  }

  onceEvent<T>(
    event: SocketEvents | ChatEvents | PresenceEvents
  ): Promise<EventEnvelope<T>> {
    return new Promise((resolve) => {
      this.socket?.once(event, (envelope: EventEnvelope<T>) => {
        resolve(envelope);
      });
    });
  }

  // ----------------------------------
  // Chat helpers
  // ----------------------------------
  joinChat(chatId: string): void {
    this.emitEvent(SocketEvents.CHAT_JOIN_ROOM, { chatId });
  }

  leaveChat(chatId: string): void {
    this.emitEvent(SocketEvents.CHAT_LEAVE_ROOM, { chatId });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const socketService = SocketService.getInstance();
