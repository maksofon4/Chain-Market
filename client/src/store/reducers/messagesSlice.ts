// messagesSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Message } from "models/messages";
import { allMessagesData } from "models/messages";

const initialState = {
  items: {},
};

export const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<allMessagesData>) => {
      state.items = action.payload;
    },
    addMessage: (
      state,
      action: PayloadAction<{ message: Message; currentUserId: string }>
    ) => {
      const { message, currentUserId } = action.payload;

      if (message.from === currentUserId || message.to === currentUserId) {
        const chatKey =
          message.from === currentUserId ? message.to : message.from;

        if (!state.items[chatKey]) {
          state.items[chatKey] = [];
        }

        if (message.from === currentUserId) {
          message.status = "checked";
        }

        state.items[chatKey].push(message);
      } else {
        console.log("Message not for the current user.");
      }
    },
    markMessagesChecked: (state, action: PayloadAction<string>) => {
      const chatId = action.payload;
      if (!state.items[chatId]) return;
      state.items[chatId] = state.items[chatId].map((msg: Message) =>
        msg.from === chatId ? { ...msg, status: "checked" } : msg
      );
    },
  },
});

export const { setMessages, addMessage, markMessagesChecked } =
  messagesSlice.actions;

export default messagesSlice.reducer;
