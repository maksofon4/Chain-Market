import { Request } from "express";

export interface singleFileRequest extends Request {
  fileName?: string;
}
