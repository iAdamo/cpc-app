import DateFormatter from "./DateFormat";
import { ChatItem, Message } from "@/types";

export const groupMessages = ({
  messages,
}: {
  messages: Message[];
}): ChatItem[] => {
  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString);

    if (DateFormatter.isToday(date)) return "Today";
    if (DateFormatter.isYesterday(date)) return "Yesterday";
    return DateFormatter.format(date, "MMM d, yyyy");
  };

  const buildGroupedMessages = (): ChatItem[] => {
    const sorted = [...messages].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const result: ChatItem[] = [];
    let lastLabel: string | null = null;

    for (const msg of sorted) {
      const label = getDateLabel(msg.createdAt);
      if (label !== lastLabel) {
        result.push({ type: "header", label });
        lastLabel = label;
      }
      result.push({ type: "message", id: msg._id, message: msg });
    }

    return result.reverse(); // reverse for inverted FlatList
  };

  const newGroupedMessages = buildGroupedMessages();

  return newGroupedMessages;
};
