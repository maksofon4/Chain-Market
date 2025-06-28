import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const userData = req.body;
      const result = await AuthService.register(userData);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const credentials = req.body;
      const result = await AuthService.login(credentials);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(401).json({ message: error.message });
    }
  }
}
