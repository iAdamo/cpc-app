import { SectionList } from "react-native";
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
} from "@/types";
import useGlobalStore from "@/store/globalStore";

class ChatService {
  private axiosInstance;
  private socket;
  private currentChat: Chat | null = null;

  constructor() {
    const { axiosInstance } = ApiClientSingleton.getInstance();
    const socket = socketService;
    this.axiosInstance = axiosInstance;
    this.socket = socket;
  }

  // connect to socket server
  async connect(): Promise<void> {
    await this.socket.connect();
  }

  // Chat Management
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
    // console.log("User chats:", response.data);
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

  // Real-time Messaging
  async checkOnlineStatus(userId: string): Promise<boolean> {
    return new Promise((resolve) => {
      const handler = (data: { userId: string; online: boolean }) => {
        if (data.userId === userId) {
          this.socket.offEvent("online_status", handler); // Clean up listener
          resolve(data.online);
        }
      };
      this.socket.onEvent("online_status", handler);
      this.socket.emitEvent("check_online", { userId });
    });
  }

  async sendMessage(params: SendMessageParams): Promise<void> {
    this.socket.emitEvent("send_message", params);
  }

  async sendTextMessage(
    chatId: string,
    text: string,
    replyTo?: string
  ): Promise<void> {
    const messageParams: SendMessageParams = {
      chatId,
      type: "text",
      content: { text },
      replyTo,
    };
    await this.sendMessage(messageParams);
  }

  async sendMediaMessage(
    chatId: string,
    mediaUrl: string,
    type: "text" | "image" | "video" | "audio" | "file" | "system",
    options: Partial<MessageContent> = {},
    replyTo?: string
  ): Promise<void> {
    const messageParams: SendMessageParams = {
      chatId,
      type,
      content: { mediaUrl, ...options },
      replyTo,
    };
    await this.sendMessage(messageParams);
  }

  // Real-time Event Handling

  offEvent(event: string, callback?: (data: any) => void): void {
    this.socket.offEvent(event, callback);
  }

  onNewMessage(callback: (message: { message: Message }) => void): void {
    this.socket.onEvent("new_message", callback);
  }

  onMessageError(callback: (error: any) => void): void {
    socketService.onEvent("message_error", callback);
  }

  onUserTyping(
    callback: (data: {
      userId: string;
      chatId: string;
      typing: boolean;
    }) => void
  ): void {
    socketService.onEvent("user_typing", callback);
  }

  onMessagesDelivered(
    callback: (data: { userId: string; chatId: string }) => void
  ): void {
    socketService.onEvent("messages_delivered", callback);
  }

  // Typing Indicators
  startTyping(chatId: string): void {
    socketService.emitEvent("typing_start", { chatId });
  }

  stopTyping(chatId: string): void {
    socketService.emitEvent("typing_stop", { chatId });
  }
  // Message Status
  markMessagesAsDelivered(chatId: string): void {
    socketService.emitEvent("mark_delivered", { chatId });
  }

  // Chat Room Management
  joinChat(chat: Chat): void {
    this.currentChat = chat;
    useGlobalStore.setState({ selectedChat: chat });
    socketService.joinChat(chat._id);
  }

  leaveCurrentChat(): void {
    if (this.currentChat) {
      socketService.leaveChat(this.currentChat._id);
      this.currentChat = null;
    }
  }
  // Cleanup
  disconnect(): void {
    this.leaveCurrentChat();
    socketService.disconnect();
  }
}

const chatService = new ChatService();
export default chatService;
