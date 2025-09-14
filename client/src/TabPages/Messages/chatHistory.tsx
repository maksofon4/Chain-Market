import React, { useEffect, useRef } from "react";
import { Message } from "models/messages";

const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // Use 24-hour format if false
  });
};

interface Props {
  chatId: string; // The chatId (the ID of the user you are chatting with)
  sessionUserId: string; // The current user id from the session
  chatHistory: { [userId: string]: Message[] }; // The entire chat history
  onMediaSelect: (string) => void;
}

const MessagesList: React.FC<Props> = ({
  chatId,
  sessionUserId,
  chatHistory,
  onMediaSelect,
}) => {
  // Get the messages for the current chat
  const messages = chatHistory[chatId] || [];

  // Separate old and new messages based on the 'status'
  const oldMessages = messages.filter((msg) => msg.status !== "new");
  const newMessages = messages.filter((msg) => msg.status === "new");

  // Reference for the messages container
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // Scroll to the bottom of the container when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

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
            <img
              src={"/uploads/" + product.images[0]}
              alt={product.productName}
            />
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
                    onClick={() => onMediaSelect(`/uploads/${img}`)}
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

  return (
    <div id="messages" ref={messagesContainerRef}>
      {/* Render old messages first */}
      {oldMessages.map((msg, index) => renderMessage(msg, index))}

      {newMessages.length > 0 ? (
        <div className="newMessagesBorder" ref={messagesContainerRef}>
          New messages
        </div>
      ) : (
        <div ref={messagesContainerRef}></div>
      )}

      {/* Render new messages */}
      {newMessages.map((msg, index) => renderMessage(msg, index))}
    </div>
  );
};

export default MessagesList;
