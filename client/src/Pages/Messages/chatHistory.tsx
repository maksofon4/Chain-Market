import React, { useEffect, useRef, useState } from "react";
import { Message } from "models/messages";
import { formatDate } from "./sortChats";

// Redux toolkit slice
import { useDispatch } from "react-redux";
import { markMessagesChecked } from "store/reducers/messagesSlice";

// RTKQuerry
import { useMarkAsCheckedMutation } from "services/messageServices";

interface Props {
  chatId: string;
  sessionUserId: string;
  chatHistory: { [userId: string]: Message[] };
  onMediaSelect: (string) => void;
}

const MessagesList: React.FC<Props> = ({
  chatId,
  sessionUserId,
  chatHistory,
  onMediaSelect,
}) => {
  const messages = chatHistory[chatId] || [];
  // RTKQuerry
  const [markAsCheckedApi, markAsCheckedApiResult] = useMarkAsCheckedMutation();

  // Redux Slice
  const dispatch = useDispatch();

  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [showNewMessagesBar, setShowNewMessagesBar] = useState<boolean>(false);

  const staticCheckedMessagesRef = useRef<Message[]>([]);
  const staticNewMessagesRef = useRef<Message[]>([]);
  const staticAllMessagesRef = useRef<Message[]>([]);

  // Separate old and new messages based on the 'status'
  const oldMessages = messages.filter((msg) => msg.status !== "new");
  const newMessages = messages.filter((msg) => msg.status === "new");

  useEffect(() => {
    staticCheckedMessagesRef.current = oldMessages;
    staticNewMessagesRef.current = newMessages;
    staticAllMessagesRef.current = messages;
    if (staticNewMessagesRef.current.length > 0) {
      setShowNewMessagesBar(true);
      markAsChecked(chatId);
    }
  }, [chatId]);

  useEffect(() => {
    const incomingMessages = messages.filter(
      (msg) =>
        !staticAllMessagesRef.current.some((prevMsg) => prevMsg.id === msg.id)
    );

    if (incomingMessages.length > 0) {
      staticNewMessagesRef.current = [
        ...staticNewMessagesRef.current,
        ...incomingMessages,
      ];
      staticAllMessagesRef.current = [
        ...staticAllMessagesRef.current,
        ...incomingMessages,
      ];
    }

    setCurrentMessages(staticNewMessagesRef.current);
  }, [messages]);

  // Reference for the messages container
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // Scroll to the bottom of the container when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [currentMessages]);

  // Function to render individual messages
  const renderMessage = (msg: Message, index: number) => {
    const messageClass = msg.from === sessionUserId ? "sent" : "received";
    const messageContent = msg.content;

    if ("product" in messageContent) {
      const product =
        typeof messageContent.product === "string"
          ? JSON.parse(messageContent.product)
          : messageContent.product;

      return (
        <div key={index} className={`message-product ${messageClass}`}>
          <div className="redirected-product-container">
            <img src={product.images[0]} alt={product.productName} />
            <p className="product-name">{product.name}</p>
            <p className="product-price">{product.price}$</p>
            <p className="product-location">{product.location}</p>
            <p className="product-date-posted">{product.formattedDateTime}</p>
          </div>
          <div className="Files">{msg.file}</div>
          <p className="messageText">{messageContent.text}</p>
          <p className="message-time-sent">{formatDate(msg.timestamp)}</p>
        </div>
      );
    }

    if ("text" in messageContent) {
      return (
        <div key={index} className={`message-simple ${messageClass}`}>
          <div className="Files">
            {messageContent.attachments &&
              messageContent.attachments.map((img, index) => {
                return (
                  <img
                    key={index}
                    src={`/uploads/${img}`}
                    alt="message file"
                    onClick={() => onMediaSelect(`${img}`)}
                  />
                );
              })}
          </div>
          <p className="messageText">{messageContent.text}</p>
          <p className="message-time-sent">{formatDate(msg.timestamp)}</p>
        </div>
      );
    }
  };

  const markAsChecked = async (chatId: string) => {
    if (!newMessages || newMessages.length === 0) return;

    markAsCheckedApi(chatId);

    if (!markAsCheckedApiResult) return;
    dispatch(markMessagesChecked(chatId));
  };

  return (
    <div id="messages" ref={messagesContainerRef}>
      {staticCheckedMessagesRef.current.map((msg, index) =>
        renderMessage(msg, index)
      )}

      {showNewMessagesBar ? (
        <div className="newMessagesBorder" ref={messagesContainerRef}>
          New messages
        </div>
      ) : (
        <div ref={messagesContainerRef}></div>
      )}

      {currentMessages.map((msg, index) => renderMessage(msg, index))}
    </div>
  );
};

export default MessagesList;
