interface messageContent {
  text?: string;
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
