interface messageContent {
  text?: string;
  attachments?: string[];
}

export interface Message {
  from: string;
  to: string;
  content: messageContent;
  timestamp: string;
  file: string[];
  status: string;
}
