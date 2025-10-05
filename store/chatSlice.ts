import { StateCreator } from "zustand";
import { GlobalStore, ChatState, Message, UserData, Chat } from "@/types";
import chatService from "@/services/chatService";

export const chatSlice: StateCreator<GlobalStore, [], [], ChatState> = (
  set,
  get
) => ({
  chats: [],
  selectedChatId: null,
  messages: [],
  chatLoading: false,
  chatError: null,
  typingUsers: [],
  hasMoreMessages: true,

  createChat: async (
    participantIds: string,
    isGroup: boolean = false,
    groupInfo?: Partial<Chat["groupInfo"]>
  ): Promise<Chat> => {
    try {
      set({ chatLoading: true, chatError: null });
      const newChat = await chatService.createDirectChat(participantIds);

      set((state) => {
        const chatsMap = new Map(state.chats.map((c) => [c._id, c]));
        chatsMap.set(newChat._id, newChat);

        return {
          chats: Array.from(chatsMap.values()),
          chatLoading: false,
        };
      });

      return newChat;
    } catch (error: any) {
      set({
        chatError:
          error instanceof Error ? error.message : "Failed to create chat",
        chatLoading: false,
      });
      throw error;
    }
  },

  fetchChats: async () => {
    set({ chatLoading: true, chatError: null });
    try {
      const userChats = await chatService.getUserChats();
      console.log("Fetched chats:", userChats);
      set({ chats: userChats, chatLoading: false });
    } catch (error: any) {
      set({
        chatError:
          error instanceof Error ? error.message : "Failed to load chats",
        chatLoading: false,
      });
    }
  },
  sendTextMessage: async (text: string, replyTo?: string) => {
    const { selectedChatId } = get();
    if (!selectedChatId) throw new Error("No chat selected");
    try {
      await chatService.sendTextMessage(selectedChatId, text, replyTo);
    } catch (error) {
      console.error("Failed to send text message:", error);
      throw error;
    }
  },
  //   sendMediaMessage: async (
  //     type: Message["type"],
  //     file: any,
  //     options: Partial<Message["content"]> = {}
  //   ) => {
  //     const { selectedChatId } = get();
  //     if (!selectedChatId) throw new Error("No chat selected");
  //     try {
  //       // Upload media and get URL (implementation depends on your setup)
  //       const mediaUrl = await chatService.uploadMedia(file, type);
  //       await chatService.sendMediaMessage(selectedChatId, mediaUrl, options);
  //     } catch (error) {
  //       console.error("Failed to send media message:", error);
  //       throw error;
  //     }
  //   },
  loadMoreMessages: async () => {
    const { selectedChatId, messages, hasMoreMessages } = get();
    if (!selectedChatId) return;
    if (!hasMoreMessages) return;
    try {
      set({ chatLoading: true });
      const nextPage = Math.floor(messages.length / 100) + 1;
      const chatMessages = await chatService.getChatMessages(
        selectedChatId,
        nextPage
      );

      set((state) => ({
        messages: [...chatMessages, ...state.messages],
        hasMoreMessages: chatMessages.length === 100,
        chatLoading: false,
      }));
    } catch (error) {
      console.error("Failed to load more messages:", error);
      set({ chatLoading: false });
      throw error;
    }
  },
  markAsDelivered: async () => {
    const { selectedChatId } = get();
    if (!selectedChatId) return;
    try {
      await chatService.markMessagesAsDelivered(selectedChatId);
    } catch (error) {
      console.error("Failed to mark messages as delivered:", error);
      throw error;
    }
  },
  startTyping: () => {
    const { selectedChatId } = get();
    if (!selectedChatId) return;
    chatService.startTyping(selectedChatId);
  },
  stopTyping: () => {
    const { selectedChatId } = get();
    if (!selectedChatId) return;
    chatService.stopTyping(selectedChatId);
  },
});
