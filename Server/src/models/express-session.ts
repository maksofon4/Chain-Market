import { Request } from "express";
import { Session } from "express-session";

export interface SessionRequest extends Request {
  session: Session & {
    userId?: string;
    username?: string;
    email?: string;
  };
}
