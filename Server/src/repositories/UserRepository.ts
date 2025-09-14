import { usersDir, defaultImagesDir } from "../config/env";
import { User, UserPublic } from "../models/User";
import bcrypt from "bcrypt";
import postgreSql from "../../data/dataBase/postgre";

const filePath = `../${usersDir}`;
export class UserRepository {
  static async findByEmail(email: string): Promise<User | null> {
    const result = await postgreSql.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    return result.rows[0] || null; // возвращаем пользователя или null
  }

  static async create(user: {
    username: string;
    email: string;
    password: string;
  }): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const profilePhoto = null;

    await postgreSql.query(
      `INSERT INTO users (user_name, email, password, profile_photo)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user.username, user.email, hashedPassword, profilePhoto]
    );
    return true;
  }

  static async findManyById(ids: string[]): Promise<UserPublic[] | null> {
    const userIds = ids; // массив id

    const result = await postgreSql.query(
      `
  SELECT user_id, user_name, profile_photo, pinned_chats,
   selected_products
  FROM users
  WHERE user_id = ANY($1)
  `,
      [userIds]
    );

    return result.rows || null;
  }

  static async findOneById(id: string): Promise<User | null> {
    const result = await postgreSql.query(
      `SELECT user_id, user_name, email, profile_photo, pinned_chats,selected_products,password
       FROM users WHERE user_id = $1`,
      [id]
    );
    return result.rows[0] || null; // возвращаем пользователя или null
  }

  static async saveUser(user: User): Promise<User | null> {
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

    return result.rows[0] ?? null;
  }
}
