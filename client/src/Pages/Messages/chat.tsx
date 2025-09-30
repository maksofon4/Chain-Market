import { useMemo } from "react";
import { userProfilePhoto, userName } from "Functions/Users/usersInfo";
import { Message } from "models/messages";
import { User } from "models/user";
import { formatDate } from "./sortChats";

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
  usersInfo: User[];
  messages: Message[];
  isPinned: boolean;
  isPinButtonActive: Boolean;
  isDeleteButtonActive: boolean;
  selectedChats: string[];
}) => {
  const newMessages = useMemo(() => {
    return messages.filter((m) => m.status === "new").length;
  }, [messages]);
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
