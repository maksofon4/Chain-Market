import React, { useState, useEffect, useRef } from "react";
import { userProfilePhoto, userName } from "Functions/Users/usersInfo.ts";
import { useNavigate, useLocation, data } from "react-router-dom";
import MessagesList from "./chatHistory.tsx";
import "./messages.css";
import { ChatList } from "./sortChats.tsx";
import { usersInfo } from "models/users.ts";
import { useFetchUserQuery } from "services/userService.ts";
import { useSelector } from "react-redux";
import { sendMessage } from "Components/MessagesProvider/messagesProvider.tsx";
import { messageContent } from "models/messages.ts";
// Types
import { RootState } from "store/store.ts";
import { Product } from "models/product.ts";

const Messages = () => {
  // RTK Qurry
  const { data: user } = useFetchUserQuery();
  const chats = useSelector((state: RootState) => state.messages.items);

  const [usersInfo, setUsersInfo] = useState<usersInfo[] | null>(null);
  const [isChatSelected, setIsChatSelected] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [isPinButtonActive, setPinButtonActive] = useState(false);
  const [isDeleteButtonActive, setDeleteButtonActive] = useState(false);
  const [selectedChats, storeSelectedChats] = useState<string[]>([]);
  const [pinnedChats, setPinnedChats] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [mediaSelectedSrc, setMediaSelectedSrc] = useState<
    string | undefined
  >();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Redirected Product states
  const [redirectedProduct, setRedirectedProduct] = useState<string | null>(
    localStorage.getItem("product")
  );
  const [redirectedProductJSON, setRedirectedProductJSON] =
    useState<Product | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

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
        const userIds = getChatIds(chats);
        if (userIds.length === 0) return;
        const userRes = await fetch("/api/users-public-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: userIds }),
        });
        const users = await userRes.json();
        setUsersInfo(users);

        if (!chats || !users || !user) {
          throw new Error("Failed to fetch chat data");
        }
        if (redirectedProduct) {
          setRedirectedProductJSON(JSON.parse(redirectedProduct));
        }
        setPinnedChats(user.pinnedChats);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching chat data:", error);
      }
    };

    fetchData();
  }, [chats]);

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
    setSelectedChatId(newChatId);
    navigate(`/messages/chat/${newChatId}`);
  };

  const handleChatExit = () => {
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

  const handleSendMessage = async (
    selectedChatId: string,
    messageText: string
  ) => {
    if (messageInput.trim().length < 0) return;
    let messageData: messageContent = { text: messageText };
    let attachments = [];

    if (redirectedProductJSON) {
      if (redirectedProductJSON.userId === selectedChatId) {
        messageData = {
          product: redirectedProductJSON,
          text: messageText,
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
          attachments = data.filePaths;
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
    sendMessage(selectedChatId, messageData);
    setMessageInput("");
    if (redirectedProduct) {
      cancelForwardProduct();
    }
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

  const cancelForwardProduct = () => {
    localStorage.removeItem("product");
    setRedirectedProduct(null);
    setRedirectedProductJSON(null);
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
      {!(isMobile && isChatSelected) && !isLoading && (
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

          {!isLoading && (
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
          )}
        </div>
      )}
      {(!isMobile || (isMobile && isChatSelected)) && !isLoading && (
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
              {user && selectedChatId && chats ? (
                <MessagesList
                  chatId={selectedChatId} // Pass chatId as prop
                  sessionUserId={user.userId} // Pass sessionUserId
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
                {redirectedProduct && (
                  <div className="redirected-product d-flex gap-3 p-2">
                    <img src={redirectedProductJSON?.images[0]} alt="Product" />
                    <div className="redirected-product-info">
                      <p className="redirected-product-name">
                        {redirectedProductJSON?.name}
                      </p>
                      <p className="redirected-product-price">
                        {redirectedProductJSON?.price}
                      </p>
                    </div>
                    <button
                      onClick={() => cancelForwardProduct()}
                      id="cancelForwardButton"
                      className="rounded-3"
                    >
                      Cancel
                    </button>
                  </div>
                )}
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
