import { MediaItem, UserData } from "./user";

export interface Chat {
  _id: string;
  participants: UserData[];
  type: "direct" | "group";
  lastMessage?: LastMessage;
  groupInfo?: GroupInfo;
  createdAt: string;
  updatedAt: string;
}

export interface LastMessage {
  messageId: string;
  text: string;
  sender: UserData;
  createdAt: string;
}

export interface GroupInfo {
  name: string;
  avatarUrl?: string;
  createdBy: string;
  admins: string[];
  createdAt: string;
}

export interface Message {
  _id: string;
  chatId: string;
  senderId: UserData;
  type: "text" | "image" | "video" | "audio" | "file" | "system";
  content?: MessageContent;
  status: MessageStatus;
  replyTo?: Message;
  createdAt: string;
  updatedAt: string;
  isOptimistic?: boolean;
}

export interface MessageContent {
  text?: string;
  mediaUrl?: MediaItem | string;
  mediaType?: string;
  size?: number;
  duration?: number;
  fileName?: string;
  thumbnailUrl?: string;
}

export interface MessageStatus {
  sent: boolean;
  delivered: string[];
  read: string[];
}

export interface SendMessageParams {
  chatId: string;
  type: Message["type"];
  content?: Partial<MessageContent>;
  replyTo?: string;
}

export interface MessageSection {
  title: string;
  data: Partial<Message>[];
}

export interface Presence {
  userId: string;
  isOnline: boolean;
  lastSeen: string;
  deviceId: string;
}
