import { usersDir, defaultImagesDir } from "../config/env";
import { User, UserPublic } from "../models/User";
import bcrypt from "bcrypt";
import postgreSql from "../dataBase/postgre";
import ApiError from "../error/ApiError";

export class UserRepository {
  static async findByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await postgreSql.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      const rows = result.rows;

      return rows[0];
    } catch (error) {
      throw ApiError.internal("Unexpected error occured. Failed to find user");
    }
  }

  static async create(user: {
    username: string;
    email: string;
    password: string;
  }): Promise<object[] | undefined> {
    try {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const profilePhoto = null;

      const createUserRes = await postgreSql.query(
        `INSERT INTO users (user_name, email, password, profile_photo)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
        [user.username, user.email, hashedPassword, profilePhoto]
      );

      if (createUserRes.rows.length === 0) {
        throw ApiError.internal("Failed to create user");
      }

      return createUserRes.rows[0];
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.internal(
        "Unexpected error occured. Failed to create user."
      );
    }
  }

  static async findManyById(ids: string[]): Promise<UserPublic[] | undefined> {
    try {
      const userIds = ids;

      const result = await postgreSql.query(
        `
  SELECT user_id, user_name, profile_photo, pinned_chats,
   selected_products
  FROM users
  WHERE user_id = ANY($1)
  `,
        [userIds]
      );

      if (result.rows.length === 0) {
        throw ApiError.internal("Users with given ids not found");
      }

      return result.rows;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.internal(
        "Unexpected error occured. Failed to find users."
      );
    }
  }

  static async findOneById(id: string): Promise<User | undefined> {
    try {
      const result = await postgreSql.query(
        `SELECT user_id, user_name, email, profile_photo, pinned_chats,selected_products,password
       FROM users WHERE user_id = $1`,
        [id]
      );

      return result.rows[0];
    } catch (error) {
      throw ApiError.internal(
        "Unexpected error occured. Failed to find user by id."
      );
    }
  }

  static async saveUser(user: User): Promise<User | undefined> {
    try {
      const result = await postgreSql.query(
        `UPDATE users
   SET user_name = $1,
       email = $2,
       profile_photo = $3,
       pinned_chats = $4,
       selected_products = $5,
       password = $6
   WHERE user_id = $7
   RETURNING *`,
        [
          user.user_name,
          user.email,
          user.profile_photo,
          user.pinned_chats,
          user.selected_products,
          user.password,
          user.user_id,
        ]
      );

      if (result.rows.length === 0) {
        throw ApiError.internal("Failed to save user");
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.internal("Unexpected error occured. Failed to save user");
    }
  }
}
