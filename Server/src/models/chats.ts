import { Socket } from "socket.io";

export interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: object;
  sentAt: Date;
  status: string;
}
export interface CustomSocket extends Socket {
  userId?: string;
}

export interface messageFromClient {
  toUserId: string; // recipient user ID
  message: object;
  files?: string[];
  fromUserId: string;
}
