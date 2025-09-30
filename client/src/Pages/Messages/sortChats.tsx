import React, { useMemo } from "react";
import { Message } from "models/messages";
import { Chat } from "./chat";

// Define the type for each chat item
interface Chat {
  otherUserId: string;
  messages: Message[];
  chatId?: string;
}

interface Props {
  chats: { [userId: string]: Message[] };
  pinnedChats: string[]; // List of pinned chat IDs
  handleChatSelect: (userId: string) => void; // Function to handle chat click
  usersInfo: any;
  selectedChat?: string | null;
  isPinButtonActive: boolean;
  isDeleteButtonActive: boolean;
  selectedChats: string[];
}

export const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // Use 24-hour format if false
  });
};

// ChatList component handles the list of chats, sorts them, and renders Chat components
export const ChatList: React.FC<Props> = ({
  chats,
  pinnedChats,
  handleChatSelect,
  usersInfo,
  selectedChat,
  isPinButtonActive,
  isDeleteButtonActive,
  selectedChats,
}) => {
  const chatEntries = Object.entries(chats).map(([userId, messages]) => ({
    otherUserId: userId,
    messages,
  }));

  const sortedChats = chatEntries.sort((a, b) => {
    const isPinnedA = pinnedChats.includes(a.otherUserId);
    const isPinnedB = pinnedChats.includes(b.otherUserId);

    if (isPinnedA && !isPinnedB) return -1;
    if (!isPinnedA && isPinnedB) return 1;

    const lastMessageA = a.messages[a.messages.length - 1];
    const lastMessageB = b.messages[b.messages.length - 1];

    const timestampA = lastMessageA
      ? new Date(lastMessageA.timestamp).getTime()
      : 0;
    const timestampB = lastMessageB
      ? new Date(lastMessageB.timestamp).getTime()
      : 0;

    return timestampB - timestampA;
  });

  return (
    <div className="chats-messages">
      {sortedChats.map((chat) => {
        const isPinned = pinnedChats.includes(chat.otherUserId);

        return (
          <Chat
            key={chat.otherUserId}
            onClick={() => {
              handleChatSelect(chat.otherUserId);
            }}
            otherUserId={chat.otherUserId}
            selectedChat={selectedChat}
            usersInfo={usersInfo}
            messages={chat.messages}
            isPinned={isPinned} // Pass it as a prop
            isPinButtonActive={isPinButtonActive}
            isDeleteButtonActive={isDeleteButtonActive}
            selectedChats={selectedChats}
          />
        );
      })}
    </div>
  );
};
