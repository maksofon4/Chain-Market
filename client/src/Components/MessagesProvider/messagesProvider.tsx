import { ReactNode, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { useFetchUserQuery } from "services/userService";
import { useFetchChatHistoryQuery } from "services/messageServices";
import { addMessage, setMessages } from "store/reducers/messagesSlice";
import { messageContent } from "models/messages";
import { Message } from "models/messages";

let socket: Socket | null = null;

export const MessagesProvider = ({ children }: { children: ReactNode }) => {
  const { data: user } = useFetchUserQuery();
  const { data: messagesData } = useFetchChatHistoryQuery();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user?.userId) return;

    socket = io("/", {
      path: "/socket.io",
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("Connected:", socket?.id);
      socket?.emit("join", user.userId);
    });

    socket.on("private message", (message: Message) => {
      dispatch(
        addMessage({
          currentUserId: user.userId,
          message,
        })
      );
    });

    return () => {
      socket?.disconnect();
    };
  }, [user, dispatch]);

  useEffect(() => {
    if (messagesData) {
      dispatch(setMessages(messagesData));
    }
  }, [messagesData, dispatch]);

  return <>{children}</>;
};

export const sendMessage = (toUserId: string, message: messageContent) => {
  socket?.emit("private message", { toUserId, message });
};
