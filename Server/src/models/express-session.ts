import { Request } from "express";
import { Session } from "express-session";

export interface SessionRequest extends Request {
  session: Session &
    Partial<{
      userId: string;
      username: string;
      email: string;
      password: string;
      profilePhoto: string;
      pinnedChats: string[];
      selectedProducts: string[];
    }>;
}
