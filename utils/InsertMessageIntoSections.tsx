import { MessageSection, Message } from "@/types";

export function insertMessageIntoSections(
  sections: { title: string; data: Message[] }[],
  message: Message
) {
  const dateTitle = "Today"; // or compute like BE

  const index = sections.findIndex((s) => s.title === dateTitle);

  if (index === -1) {
    return [{ title: dateTitle, data: [message] }, ...sections];
  }

  const updated = [...sections];
  updated[index] = {
    ...updated[index],
    data: [message, ...updated[index].data],
  };

  return updated;
}

export function replaceTempMessage(
  sections: MessageSection[],
  realMessage: Message
): MessageSection[] {
  let replaced = false;
console.log("replace mesage")
  const updatedSections = sections.map((section) => {
    const updatedData = section.data.map((msg) => {
      // if (
      //   msg.isOptimistic &&
      //   msg._id === realMessage.clientId // best case
      // ) {
      //   replaced = true;
      //   return realMessage;
      // }
      if (msg.isOptimistic && msg.chatId === realMessage.chatId) {
        replaced = true;
        return realMessage;
      }

      return msg;
    });

    return { ...section, data: updatedData };
  });

  // If we didn’t replace anything, append it normally
  if (!replaced) {
    return insertMessageIntoSections(updatedSections as any, realMessage);
  }

  return updatedSections;
}
