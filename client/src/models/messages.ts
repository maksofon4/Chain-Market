import { Product } from "./product";

export interface messageContent {
  text?: string;
  product?: Product;
  attachments?: string[];
}

export interface Message {
  id: string;
  from: string;
  to: string;
  content: messageContent;
  timestamp: string;
  file: string[];
  status: string;
}

export type allMessagesData = Record<string, Message[]>;
