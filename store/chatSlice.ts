import { StateCreator } from "zustand";
import { GlobalStore, ChatState, Message, Chat } from "@/types";
import chatService from "@/services/chatService";
import { uploadChatMedia } from "@/services/axios/chat";
import appendFormData from "@/utils/AppendFormData";

export const chatSlice: StateCreator<GlobalStore, [], [], ChatState> = (
  set,
  get
) => ({
  chats: [],
  filteredChats: [],
  selectedChat: null,
  currentPage: 1,
  messages: [],
  chatLoading: false,
  chatError: null,
  typingUsers: [],
  hasMoreMessages: true,
  nextCursor: null,

  setFilteredChats: (chats: Chat[]) => set({ filteredChats: chats }),
  setChats: (chats: Chat[]) => set({ chats: chats }),

  createChat: async (
    participantIds: string,
    isGroup: boolean = false,
    groupInfo?: Partial<Chat["groupInfo"]>
  ) => {
    try {
      set({ chatLoading: true, error: null });
      const newChat = await chatService.createDirectChat(participantIds);
      set({ selectedChat: newChat });
    } catch (error: any) {
      set({
        error:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to create chat",
        chatLoading: false,
      });
    }
  },

  fetchChats: async () => {
    set({ chatLoading: true, chatError: null });
    try {
      const userChats = await chatService.getUserChats();
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

    // Create temp ID once at the beginning
    const tempId = `temp-${Date.now()}`;

    try {
      const senderId = get().user?._id;
      if (!senderId) throw new Error("User not authenticated");

      // Create optimistic message
      const optimisticMessage: any = {
        _id: tempId,
        content: { text },
        senderId: get().user?._id,
        chatId: selectedChat._id,
        createdAt: new Date().toISOString(),
        type: "text",
        isOptimistic: true,
        replyTo: replyTo ? ({ _id: replyTo } as any) : undefined,
        updatedAt: new Date().toISOString(),
      };

      console.log("Adding optimistic message:", tempId);

      // Add optimistic message to the beginning of messages array
      set((state) => ({
        messages: [optimisticMessage, ...state.messages],
      }));

      // Send actual message
      await chatService.sendTextMessage(selectedChat._id, text, replyTo);

      // Update chats list
      set((state) => {
        const chatsMap = new Map(state.chats.map((c) => [c._id, c]));
        chatsMap.set(selectedChat._id, selectedChat);
        return {
          chats: Array.from(chatsMap.values()),
        };
      });
    } catch (error) {
      console.error("Failed to send text message:", error);
      // Remove optimistic message on error using the SAME tempId
      console.log("Removing optimistic message on error:", tempId);
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== tempId),
      }));
      throw error;
    }
  },

  sendMediaMessage: async (
    type: Message["type"],
    file: any,
    options: Partial<Message["content"]> = {},
    onProgress?: (progress: number) => void
  ) => {
    const { selectedChat } = get();
    if (!selectedChat) throw new Error("No chat selected");

    try {
      // Create optimistic message for media
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage: any = {
        _id: tempId,
        content: { ...options },
        senderId: get().user!,
        chatId: selectedChat._id,
        createdAt: new Date().toISOString(),
        type,
        isOptimistic: true,
        updatedAt: new Date().toISOString(),
      };

      // Add optimistic message
      set((state) => ({
        messages: [optimisticMessage, ...state.messages],
      }));

      // Upload media
      const formData = new FormData();
      appendFormData(formData, file, "file");
      const mediaUrl = await uploadChatMedia(formData, onProgress);

      // Send media message
      await chatService.sendMediaMessage(
        selectedChat._id,
        mediaUrl.file,
        type,
        options
      );
    } catch (error) {
      console.error("Failed to send media message:", error);
      // Remove optimistic message on error
      const tempId = `temp-${Date.now()}`;
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== tempId),
      }));
      throw error;
    }
  },

  loadMessages: async (cursor?: Date) => {
    const { selectedChat, messages } = get();
    if (!selectedChat) return;

    try {
      set({ chatLoading: true });

      // Call updated backend service that returns simple array
      const response = await chatService.getChatMessages(
        selectedChat._id,
        cursor
      );

      // console.log(
      //   "Loaded messages:",
      //   response.messages.length,
      //   "cursor:",
      //   cursor,
      //   "hasMore:",
      //   response.hasMore
      // );

      // Ensure we have valid arrays
      const newMessages = response.messages || [];
      const currentMessages = messages || [];

      set({
        // For initial load (no cursor), replace all messages
        // For loading older messages (cursor exists), prepend to the beginning
        // Messages are in chronological order (oldest first) from backend
        messages: cursor
          ? [...newMessages, ...currentMessages] // Older messages prepended
          : newMessages, // Initial load
        nextCursor: response.nextCursor,
        hasMoreMessages: response.hasMore,
        chatLoading: false,
      });
    } catch (error) {
      console.error("Failed to load messages:", error);
      set({
        chatLoading: false,
        chatError:
          error instanceof Error ? error.message : "Failed to load messages",
      });
    }
  },

  loadMoreMessages: async () => {
    const { hasMoreMessages, chatLoading, nextCursor } = get();

    console.log("loadMoreMessages called:", {
      hasMoreMessages,
      chatLoading,
      nextCursor,
      nextCursorISO: nextCursor?.toISOString(),
    });

    if (chatLoading) {
      console.log("Already loading, skipping");
      return;
    }

    if (!hasMoreMessages) {
      console.log("No more messages to load");
      return;
    }

    if (!nextCursor) {
      console.log("No cursor available");
      return;
    }

    await get().loadMessages(nextCursor);
  },

  addNewMessage: (message: Message) => {
    // Add new message to the beginning (for inverted FlatList)
    // Check if message already exists to avoid duplicates
    set((state) => {
      const exists = state.messages.some((msg) => msg._id === message._id);
      if (exists) {
        console.log("Message already exists, skipping:", message._id);
        return state;
      }
      return {
        messages: [message, ...state.messages],
      };
    });
  },

  replaceTempMessage: (tempId: string, realMessage: Message) => {
    // Replace optimistic message with real one
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id === tempId ? realMessage : msg
      ),
    }));
  },

  markAsDelivered: async () => {
    const { selectedChat } = get();
    if (!selectedChat) return;
    try {
      await chatService.markMessagesAsDelivered(selectedChat._id);
    } catch (error) {
      console.error("Failed to mark messages as delivered:", error);
      throw error;
    }
  },

  startTyping: () => {
    const { selectedChat } = get();
    if (!selectedChat) return;
    chatService.startTyping(selectedChat._id, true);
  },

  stopTyping: () => {
    const { selectedChat } = get();
    if (!selectedChat) return;
    chatService.startTyping(selectedChat._id, false);
  },

  clearMessages: () => {
    // Clear messages when leaving chat
    set({
      messages: [],
      hasMoreMessages: true,
      nextCursor: null,
      chatError: null,
    });
  },

  // Optional: Add a method to update a specific message
  updateMessage: (messageId: string, updates: Partial<Message>) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id === messageId ? { ...msg, ...updates } : msg
      ),
    }));
  },
});
