import React, { useState, useEffect, useRef } from "react";
import { userProfilePhoto, userName } from "Functions/Users/usersInfo.ts";
import { useNavigate, useLocation } from "react-router-dom";
import MessagesList from "./chatHistory.tsx";
import { io, Socket } from "socket.io-client";
import "./messages.css";
import { Message } from "models/messages.ts";
import { ChatList } from "./sortChats.tsx";
import { usersInfo } from "models/users.ts";
import { SessionContext } from "Components/GlobalData/GlobalData.tsx";
import { useContext } from "react";

const Messages = () => {
  const sessionInfo = useContext(SessionContext);
  const user = sessionInfo?.user;

  const [chats, setChats] = useState<{ [chatId: string]: Message[] }>({});
  const [usersInfo, setUsersInfo] = useState<usersInfo[] | null>(null);
  const [isChatSelected, setIsChatSelected] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const [isPinButtonActive, setPinButtonActive] = useState(false);
  const [isDeleteButtonActive, setDeleteButtonActive] = useState(false);
  const [selectedChats, storeSelectedChats] = useState<string[]>([]);
  const [pinnedChats, setPinnedChats] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [mediaSelectedSrc, setMediaSelectedSrc] = useState<
    string | undefined
  >();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const redirectedProduct = localStorage.getItem("product");

  const chatIdFromURL = location.pathname.split("/").pop();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(
    chatIdFromURL || null
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getChatIds = (chatHistory: Record<string, any[]>) => {
    const userIds: string[] = [];
    Object.keys(chatHistory).forEach((userId) => {
      userIds.push(userId);
    });
    return userIds;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const chatHistoryRes = await fetch(`/api/chats-history`);
        const chatData = await chatHistoryRes.json();
        const userIds = getChatIds(chatData);
        if (userIds.length === 0) return;
        const userRes = await fetch("/api/users-public-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: userIds }),
        });
        const users = await userRes.json();
        setUsersInfo(users);

        if (!chatHistoryRes.ok || !users || !sessionInfo) {
          throw new Error("Failed to fetch chat data");
        }
        setPinnedChats(sessionInfo.user.pinnedChats);
        setChats(chatData);
      } catch (error) {
        console.error("Error fetching chat data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!socketRef.current && user?.userId) {
      socketRef.current = io("/", {
        path: "/socket.io",
        withCredentials: true,
      });

      socketRef.current.on("connect", () => {
        console.log("Connected:", socketRef.current?.id);
      });

      socketRef.current.emit("join", user.userId);
      console.log("User joined with ID:", user.userId);

      socketRef.current.on("disconnect", () => {
        console.log("Disconnected");
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?.userId]);

  useEffect(() => {
    if (!socketRef.current || !user?.userId) return;
    socketRef.current.on("private message", (message) => {
      if (!chats) {
        return;
      }

      setChats((prevChats) => {
        if (!prevChats) {
          return prevChats;
        }

        const userId = user.userId;

        if (message.from === userId || message.to === userId) {
          const chatKey = message.from === userId ? message.to : message.from;
          const chatMessages = prevChats[chatKey] || [];
          if (message.from === userId) message.status = "checked";
          return {
            ...prevChats,
            [chatKey]: [...chatMessages, message],
          };
        } else {
          console.log("Message not for the current user.");
          return prevChats;
        }
      });
    });
  }, [user?.userId]);

  useEffect(() => {
    if (selectedChatId && chats && chats[selectedChatId]) {
      setIsChatSelected(true);
    } else {
      setIsChatSelected(false);
    }
  }, [selectedChatId, chats]);

  const handleChatSelect = (newChatId: string) => {
    if (isPinButtonActive || isDeleteButtonActive) {
      handleCheckboxChange(newChatId);
      return;
    }

    setSelectedChatId((oldChatId) => {
      if (oldChatId) markAsChecked(oldChatId);
      return newChatId;
    });
    navigate(`/messages/chat/${newChatId}`);
  };

  const handleChatExit = () => {
    if (selectedChatId) markAsChecked(selectedChatId);
    setSelectedChatId(null);
    setIsChatSelected(false);
    navigate(`/messages`);
  };

  const handleCheckboxChange = (chatId: string) => {
    storeSelectedChats((prevSelectedChats) => {
      if (prevSelectedChats && prevSelectedChats.includes(chatId)) {
        // If the chat is already selected, remove it from the array
        return prevSelectedChats.filter((id) => id !== chatId);
      } else {
        // If the chat is not selected, add it to the array
        return [...prevSelectedChats, chatId];
      }
    });
  };

  const markAsChecked = async (currentChatId: string) => {
    const newMessages = chats[currentChatId]?.filter(
      (msg) => msg.from === currentChatId && msg.status !== "checked"
    );
    if (!newMessages || newMessages.length === 0) return;
    try {
      const response = await fetch(`/api/update-message-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          forUserId: currentChatId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update message status");
      }
      setChats((prevChats) => {
        if (!prevChats) {
          return prevChats;
        }

        return {
          ...prevChats,
          [currentChatId]: prevChats[currentChatId].map((msg) => ({
            ...msg,
            status: msg.from === currentChatId ? "checked" : msg.status,
          })),
        };
      });
      console.log("Message status updated successfully");
    } catch (error) {
      console.error("Error updating message status:", error);
    }
  };

  const handleSendMessage = async (
    selectedChatId: string,
    messageText: string | object
  ) => {
    let messageData = { text: messageText };
    let messageFiles = [];

    if (redirectedProduct) {
      const productJSON = JSON.parse(redirectedProduct);
      if (productJSON.user.userId === selectedChatId) {
        console.log(productJSON);
        messageData = {
          class: "redirectedProduct",
          product: redirectedProduct,
          additionalMessage: messageText,
        };
      }
    }
    if (attachedFiles.length > 0) {
      const files = attachedFiles;

      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file); // 'images' is the field name in the server
      });

      try {
        const response = await fetch("/api/upload-file-for-chat", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        console.log("Upload Response:", data);

        if (data.filePaths) {
          messageFiles = data.filePaths;
          // Handle the uploaded file paths (e.g., show them in the chat)
          data.filePaths.forEach((filePath: string) => {
            console.log("File uploaded to:", filePath);
          });
        }
      } catch (error) {
        console.error("Upload Error:", error);
        return;
      }
    }
    if (socketRef.current) {
      socketRef.current.emit("private message", {
        toUserId: selectedChatId,
        message: messageData,
      });
      markAsChecked(selectedChatId);
      setMessageInput("");
    }
    if (redirectedProduct) localStorage.removeItem("product");
  };

  const handleAttachFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length < 6) {
      const files = Array.from(event.target.files);
      setAttachedFiles(files);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles((prevFiles) => {
      return prevFiles.filter((_, fileIndex) => fileIndex !== index);
    });
  };

  const handleRemoveAll = () => {
    setAttachedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const pinChats = async () => {
    const userId = user?.userId;
    if (!isPinButtonActive) {
      setPinButtonActive(true);
      storeSelectedChats(pinnedChats);
    } else {
      if (selectedChats !== pinnedChats) {
        const response = await fetch("/api/pin-chats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            chatIds: selectedChats,
          }),
        });
        if (response.ok) {
          setPinnedChats(selectedChats);

          console.log("pinned chats: ", selectedChats);
        } else {
          console.log("Failed to pin chats: ", selectedChats);
        }
      }
      setPinButtonActive(false);
      storeSelectedChats([]);
    }
  };

  const deleteChats = async () => {
    const userId = user?.userId;
    if (!isDeleteButtonActive) {
      storeSelectedChats([]);
      setDeleteButtonActive(true);
    } else {
      if (selectedChats.length > 0) {
        const response = await fetch("/api/delete-chats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            chatIds: selectedChats,
          }),
        });
        if (response.ok) {
          setChats((prevChats) => {
            if (!prevChats) {
              return prevChats;
            }

            return Object.fromEntries(
              Object.entries(prevChats).filter(
                ([id, messages]) =>
                  selectedChats.findIndex((chat) => chat === id) === -1
              )
            );
          });
        } else {
          console.log("Failed to delete chats: ", selectedChats);
        }
      }
      setDeleteButtonActive(false);
    }
  };

  return (
    <div className="messages-container">
      {mediaSelectedSrc && (
        <div className="mediaMaxSize">
          <div className="imgContainer">
            <button onClick={(src) => setMediaSelectedSrc(undefined)}>
              <svg className="icon icon-pushpin">
                <use xlinkHref="/symbol-defs.svg#icon-cross" />
              </svg>
            </button>
            <img src={mediaSelectedSrc} />
          </div>
        </div>
      )}
      {!(isMobile && isChatSelected) && (
        <div className="chats">
          <div className="option-buttons">
            <p>
              <button
                id={isPinButtonActive ? "pinButtonActive" : "pinButton"}
                onClick={isDeleteButtonActive ? undefined : pinChats}
              >
                <svg className="icon icon-pushpin">
                  <use xlinkHref="/symbol-defs.svg#icon-pushpin" />
                </svg>
                Pin
              </button>
              <button
                id={
                  isDeleteButtonActive ? "deleteButtonActive" : "deleteButton"
                }
                onClick={isPinButtonActive ? undefined : deleteChats}
              >
                <svg className="icon icon-bin">
                  <use xlinkHref="/symbol-defs.svg#icon-bin" />
                </svg>
                Delete
              </button>
            </p>
          </div>

          <ChatList
            chats={chats}
            pinnedChats={pinnedChats}
            handleChatSelect={handleChatSelect}
            usersInfo={usersInfo}
            selectedChat={selectedChatId}
            isPinButtonActive={isPinButtonActive}
            isDeleteButtonActive={isDeleteButtonActive}
            selectedChats={selectedChats}
          />
        </div>
      )}
      {(!isMobile || (isMobile && isChatSelected)) && (
        <div className="main-chat-window">
          {!isChatSelected ? (
            <div className="preSelectText">
              <p>Select chat to start messaging</p>
            </div>
          ) : (
            <div className="main-chat-content">
              <div className="currentUser">
                {isMobile && (
                  <button id="exitChatButton" onClick={handleChatExit}>
                    <svg className="icon ">
                      <use xlinkHref="/symbol-defs.svg#icon-arrow-left2" />
                    </svg>
                  </button>
                )}
                <img
                  src={userProfilePhoto(usersInfo, selectedChatId)}
                  alt="userProfilePhoto"
                />
                <p>{userName(usersInfo, selectedChatId)}</p>
              </div>
              {sessionInfo && selectedChatId && chats ? (
                <MessagesList
                  chatId={selectedChatId} // Pass chatId as prop
                  sessionUserId={sessionInfo.user.userId} // Pass sessionUserId
                  chatHistory={chats} // Pass the entire chat history
                  onMediaSelect={(src) => setMediaSelectedSrc(src)}
                />
              ) : (
                <p>Loading... </p> // Or any other loading message/indicator
              )}
              <div className="w-100">
                {attachedFiles.length > 0 && (
                  <div className="attached-photos">
                    <button id="removeAll" onClick={() => handleRemoveAll()}>
                      Clear
                    </button>
                    {attachedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="attachedFileContainer"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <img src={URL.createObjectURL(file)} alt={file.name} />

                        <div className="svgContainer">
                          <svg className="icon icon-attachment">
                            <use xlinkHref="/symbol-defs.svg#icon-cross" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="redirected-product" style={{ display: "none" }}>
                  <img src="/images/piano2.jpg" alt="Product" />
                  <div className="redirected-product-info">
                    <p className="redirected-product-name">
                      Acer Aspire Pure Silver
                    </p>
                    <p className="redirected-product-price">505$</p>
                  </div>
                  <button id="cancelForwardButton">Cancel</button>
                </div>
                <p className="chatInputBox">
                  <label className="attach-file-label" htmlFor="attach-file">
                    <svg className="icon icon-attachment">
                      <use xlinkHref="/symbol-defs.svg#icon-attachment" />
                    </svg>
                    <input
                      type="file"
                      id="attach-file"
                      accept="image/*"
                      multiple
                      onChange={handleAttachFile}
                      ref={fileInputRef}
                    />
                  </label>
                  <textarea
                    placeholder="Write a message..."
                    id="message-input"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                  />
                  <button
                    id="send-button"
                    onClick={() => {
                      if (selectedChatId && messageInput.length > 0) {
                        handleSendMessage(selectedChatId, messageInput);
                      } else {
                        console.log("No chat selected"); // Or any other loading message/indicator
                      }
                    }}
                  >
                    <svg className="icon icon-send">
                      <use xlinkHref="/symbol-defs.svg#icon-send" />
                    </svg>
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Messages;
