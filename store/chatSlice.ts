import { StateCreator } from "zustand";
import { GlobalStore, ChatState, Message, UserData, Chat } from "@/types";
import chatService from "@/services/chatService";

export const chatSlice: StateCreator<GlobalStore, [], [], ChatState> = (
  set,
  get
) => ({
  chats: [],
  selectedChat: null,
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
console.log(participantIds);
      const newChat = await chatService.createDirectChat(participantIds);
      console.log("Created chat:", newChat);
      set({ selectedChat: newChat });

      // set((state) => {
      //   const chatsMap = new Map(state.chats.map((c) => [c._id, c]));
      //   chatsMap.set(newChat._id, newChat);

      //   return {
      //     chats: Array.from(chatsMap.values()),
      //     chatLoading: false,
      //   };
      // });

      return newChat;
    } catch (error: any) {
      set({
        chatError:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to create chat",
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
    const { selectedChat } = get();
    if (!selectedChat) throw new Error("No chat selected");
    try {
      await chatService.sendTextMessage(selectedChat._id, text, replyTo);
      // if selectedChatId is not part of chat, then append it to it. NOTE: avoid duplicating
      set((state) => {
        const chatsMap = new Map(state.chats.map((c) => [c._id, c]));
        chatsMap.set(selectedChat._id, selectedChat);

        return {
          chats: Array.from(chatsMap.values()),
          chatLoading: false,
        };
      });
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
    const { selectedChat, messages, hasMoreMessages } = get();
    if (!selectedChat) return;
    if (!hasMoreMessages) return;
    try {
      set({ chatLoading: true });
      const nextPage = Math.floor(messages.length / 100) + 1;
      const chatMessages = await chatService.getChatMessages(
        selectedChat._id,
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
    const { selectedChat } = get();
    if (!selectedChat) return;
    try {
      chatService.markMessagesAsDelivered(selectedChat._id);
    } catch (error) {
      console.error("Failed to mark messages as delivered:", error);
      throw error;
    }
  },
  startTyping: () => {
    const { selectedChat } = get();
    if (!selectedChat) return;
    chatService.startTyping(selectedChat._id);
  },
  stopTyping: () => {
    const { selectedChat } = get();
    if (!selectedChat) return;
    chatService.stopTyping(selectedChat._id);
  },
});
