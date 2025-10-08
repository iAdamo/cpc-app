import { LastMessage } from "./../types/chat.d";
import { StateCreator } from "zustand";
import { GlobalStore, ChatState, Message, UserData, Chat } from "@/types";
import chatService from "@/services/chatService";

export const chatSlice: StateCreator<GlobalStore, [], [], ChatState> = (
  set,
  get
) => ({
  chats: [],
  selectedChat: null,
  currentPage: 1,
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
      // console.log(participantIds);
      const newChat = await chatService.createDirectChat(participantIds);
      // console.log("Created chat:", newChat);
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
      // console.log("Fetched chats:", userChats);
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

      // chatService.onNewMessage(({ message }: { message: Message }) => {
      //   console.log("New message received via socket:", message);
      //   return;
      //   set((state) => ({
      //     messages: [message, ...state.messages],
      //   }));
      // });

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

  loadMessages: async (page: number = 1) => {
    const { selectedChat } = get();
    if (!selectedChat) return;

    try {
      set({ chatLoading: true });
      const chatMessages = await chatService.getChatMessages(
        selectedChat._id,
        page
      );
      // console.log("Loaded messages:", chatMessages);
      set((state) => ({
        messages:
          page === 1 ? [...chatMessages] : [...chatMessages, ...state.messages],
        hasMoreMessages: chatMessages.length === 100,
        chatLoading: false,
        currentPage: page,
      }));
    } catch (error) {
      console.error("Failed to load messages:", error);
      set({ chatLoading: false });
      throw error;
    }
  },

  loadMoreMessages: async () => {
    const { selectedChat, hasMoreMessages, chatLoading, currentPage } = get();

    if (!selectedChat || !hasMoreMessages || chatLoading) return;

    set({ chatLoading: true });
    const nextPage = (currentPage || 1) + 1;
    await get().loadMessages(nextPage);
    // console.log("Loaded more messages:", moreMessages);
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
  // In your global store
  // addMessage: (message: Message) => {
  //   set((state) => {
  //     // Avoid duplicating messages
  //     if (state.messages.find((msg) => msg._id === message._id)) {
  //       return state;
  //     }
  //     return { messages: [message, ...state.messages] };
  //   });
  // },

  // updateChatLastMessage: (chatId: string, message: Message) => {
  //   const { chats } = get();
  //   set({
  //     chats: chats.map((chat) =>
  //       chat._id === chatId
  //         ? {
  //             ...chat,
  //             lastMessage: {
  //               messageId: message._id,
  //               text: message.content?.text || "",
  //               sender: message.senderId,
  //               createdAt: message.createdAt,
  //               // Add other LastMessage fields as needed
  //             },
  //           }
  //         : chat
  //     ),
  //   });
  // },

  // removeMessage: (messageId: string) => {
  //   set((state) => ({
  //     messages: state.messages.filter((msg) => msg._id !== messageId),
  //   }));
  // },
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
