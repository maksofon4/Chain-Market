import React from "react";
import { userProfilePhoto, userName } from "Functions/Users/usersInfo";
import { Message } from "models/messages";

interface user {
  userId: string;
  username: string;
  profilePhoto: string;
}

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

const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // Use 24-hour format if false
  });
};

// Chat component displays each individual chat
export const Chat = ({
  onClick,
  otherUserId,
  selectedChat,
  usersInfo,
  messages,
  isPinned,
  isPinButtonActive,
  isDeleteButtonActive,
  selectedChats,
}: {
  onClick: () => void;
  otherUserId: string;
  selectedChat?: string | null;
  usersInfo: user[];
  messages: Message[];
  isPinned: boolean;
  isPinButtonActive: Boolean;
  isDeleteButtonActive: boolean;
  selectedChats: string[];
}) => {
  const newMessages = messages.filter(
    (message) => message.status === "new"
  ).length;
  return (
    <div onClick={onClick} key={otherUserId} className="chat">
      <img
        src={userProfilePhoto(usersInfo, otherUserId)}
        alt="userProfilePhoto"
      />

      <div className="chat-text-container">
        <div className="chatUserNameContainer">
          <p className="username">{userName(usersInfo, otherUserId)}</p>
          {!isPinButtonActive && !isDeleteButtonActive && isPinned && (
            <p className="pinnedWord">pinned</p>
          )}
          {!isPinButtonActive && !isDeleteButtonActive && (
            <p className="message-time-sent">
              {formatDate(messages[messages.length - 1]?.timestamp || "")}
            </p>
          )}
        </div>
        <div className="chatMessagesContainer">
          <p className="chat-message-text">
            {messages[messages.length - 1].content.text}
          </p>
          {newMessages > 0 &&
            otherUserId !== selectedChat &&
            !isPinButtonActive &&
            !isDeleteButtonActive && (
              <p className="messagesCounter">{newMessages}</p>
            )}
        </div>
      </div>
      {(isPinButtonActive || isDeleteButtonActive) && (
        <span
          id={
            isDeleteButtonActive
              ? "checkboxContainerDelete"
              : "checkboxContainer"
          }
        >
          <input
            id="newCheckbox"
            type="checkbox"
            // onChange={() => setIsChecked(!isChecked)}
            checked={selectedChats.includes(otherUserId)}
            readOnly
          />
          <span id="checkboxSpan"></span>
        </span>
      )}
    </div>
  );
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

  // Sort chats: pinned ones at the top, then by the timestamp of the last message
  const sortedChats = chatEntries.sort((a, b) => {
    // Determine if chats are pinned
    const isPinnedA = pinnedChats.includes(a.otherUserId);
    const isPinnedB = pinnedChats.includes(b.otherUserId);

    if (isPinnedA && !isPinnedB) return -1; // Pinned A goes first
    if (!isPinnedA && isPinnedB) return 1; // Pinned B goes first

    // If both are pinned or both are unpinned, compare by timestamp of last message
    const lastMessageA = a.messages[a.messages.length - 1];
    const lastMessageB = b.messages[b.messages.length - 1];

    // If no messages, treat as the earliest possible date
    const timestampA = lastMessageA
      ? new Date(lastMessageA.timestamp).getTime()
      : 0;
    const timestampB = lastMessageB
      ? new Date(lastMessageB.timestamp).getTime()
      : 0;

    // Sort by the timestamp (earlier ones come first)
    return timestampB - timestampA; // Latest first
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
