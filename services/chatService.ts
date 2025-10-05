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
} from "@/types";
import useGlobalStore from "@/store/globalStore";

class ChatService {
  private axiosInstance;
  private socket;
  private currentChatId: string | null = null;

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
  ): Promise<Message[]> {
    const response = await this.axiosInstance.get(`/chat/${chatId}/messages`, {
      params: { page, limit },
    });
    return response.data;
  }

  // Real-time Messaging
  async sendMessage(params: SendMessageParams): Promise<void> {
    this.socket.emitEvent("sendMessage", params);
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
    options: Partial<MessageContent> = {},
    replyTo?: string
  ): Promise<void> {
    const messageParams: SendMessageParams = {
      chatId,
      type: "image", // Adjust based on media type
      content: { mediaUrl, ...options },
      replyTo,
    };
    await this.sendMessage(messageParams);
  }

  // Real-time Event Handling
  onNewMessage(callback: (message: Message) => void): void {
    this.socket.onEvent("newMessage", callback);
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
  joinChat(chatId: string): void {
    this.currentChatId = chatId;
    useGlobalStore.setState({ selectedChatId: chatId });
    socketService.joinChat(chatId);
  }

  leaveCurrentChat(): void {
    if (this.currentChatId) {
      socketService.leaveChat(this.currentChatId);
      this.currentChatId = null;
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
