import { ApiClientSingleton } from "./axios/conf";
import { socketService } from "./socketService";
import {
  UserData,
  Chat,
  LastMessage,
  Message,
  MessageContent,
  MessageStatus,
  SendMessageParams,
  MessageSection,
  EventEnvelope,
} from "@/types";
import useGlobalStore from "@/store/globalStore";
import { SocketEvents, ChatEvents } from "./socketService";

class ChatService {
  private axiosInstance;
  private socket;
  private currentChat: Chat | null = null;

  constructor() {
    const { axiosInstance } = ApiClientSingleton.getInstance();
    this.axiosInstance = axiosInstance;
    this.socket = socketService;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REST
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  async createDirectChat(participantId: string): Promise<Chat> {
    const response = await this.axiosInstance.post("/chat", {
      participants: participantId,
    });
    return response.data;
  }

  async getUserChats(page: number = 1, limit: number = 20): Promise<Chat[]> {
    const response = await this.axiosInstance.get("/chat/user/chats", {
      params: { page, limit },
    });
    return response.data;
  }

  async getChatMessages(
    chatId: string,
    page: number = 1,
    limit: number = 100
  ): Promise<MessageSection[]> {
    const response = await this.axiosInstance.get(`/chat/${chatId}/messages`, {
      params: { page, limit },
    });
    return response.data;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REALTIME — ENVELOPE-BASED
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async sendMessage(params: SendMessageParams): Promise<void> {
    await this.socket.emitEvent(SocketEvents.CHAT_SEND_MESSAGE, params);
  }

  async sendTextMessage(
    chatId: string,
    text: string,
    replyTo?: string
  ): Promise<void> {
    const params: SendMessageParams = {
      chatId,
      type: "text",
      content: { text },
      replyTo,
    };
    await this.sendMessage(params);
  }

  async sendMediaMessage(
    chatId: string,
    mediaUrl: string,
    type: "text" | "image" | "video" | "audio" | "file" | "system",
    options: Partial<MessageContent> = {},
    replyTo?: string
  ): Promise<void> {
    const params: SendMessageParams = {
      chatId,
      type,
      content: { mediaUrl, ...options },
      replyTo,
    };
    await this.sendMessage(params);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LISTENERS (Envelope-based)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // offEvent(event: SocketEvents, callback?: (data: any) => void): void {
  //   this.socket.offEvent(event, callback);
  // }

  onNewMessage(callback: (data: EventEnvelope) => void): void {
    this.socket.onEvent(SocketEvents.CHAT_MESSAGE_SENT, callback);
  }

  onMessageError(
    callback: (data: EventEnvelope<{ error: string; chatId?: string }>) => void
  ): void {
    this.socket.onEvent(SocketEvents.ERROR, callback);
  }

  onUserTyping(
    callback: EventEnvelope<{
      userId: string;
      chatId: string;
      typing: boolean;
    }> extends infer T
      ? (data: T) => void
      : never
  ): void {
    this.socket.onEvent(SocketEvents.CHAT_TYPING_START, callback);
    this.socket.onEvent(SocketEvents.CHAT_TYPING_STOP, callback);
  }

  onMessagesDelivered(
    callback: (data: EventEnvelope<{ userId: string; chatId: string }>) => void
  ): void {
    this.socket.onEvent(SocketEvents.CHAT_MESSAGE_DELIVERED, callback);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TYPING INDICATORS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  startTyping(chatId: string, isTyping: boolean): void {
    this.socket.emitEvent(ChatEvents.TYPING_INDICATOR, { chatId, isTyping });
  }

  stopTyping(chatId: string): void {
    this.socket.emitEvent(SocketEvents.CHAT_TYPING_STOP, { chatId });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MESSAGE STATUS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  markMessagesAsDelivered(chatId: string): void {
    this.socket.emitEvent(SocketEvents.CHAT_MESSAGE_DELIVERED, { chatId });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHAT ROOM
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  joinChat(chat: Chat): void {
    this.currentChat = chat;
    useGlobalStore.setState({ selectedChat: chat });
    this.socket.emitEvent(SocketEvents.CHAT_JOIN_ROOM, { chatId: chat._id });
  }

  leaveCurrentChat(): void {
    if (this.currentChat) {
      this.socket.emitEvent(SocketEvents.CHAT_LEAVE_ROOM, {
        chatId: this.currentChat._id,
      });
      this.currentChat = null;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CLEANUP
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  disconnect(): void {
    this.leaveCurrentChat();
    this.socket.disconnect();
  }
}

const chatService = new ChatService();
export default chatService;
