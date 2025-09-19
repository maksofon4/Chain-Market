import { promises as fs } from "fs";
import path from "path";
import { productPhotosDir } from "../config/env";
import { Product, ProductInput } from "../models/Product";
import postgreSql from "../dataBase/postgre";
import ApiError from "../error/ApiError";

const productPhotosDest = `../${productPhotosDir}`;

export class ProductRepository {
  static async getRecentProducts(
    quantity: number
  ): Promise<Product[] | undefined> {
    try {
      const query = `
    SELECT 
        p.product_id AS "productId",
        p.user_id AS "userId",
        p.name,
        p.category,
        p.description,
        p.location,
        p.price,
        p.condition,
        p.trade_possible AS "tradePossible",
     
       to_char(p.posted_at, 'DD.MM.YYYY') AS "formattedDateTime",
        json_build_object(
        'email', p.email,
        'phoneNumber', p.phone_number
    ) AS "contactDetails",
        COALESCE(
    json_agg(pi.image_url ORDER BY pi.position) FILTER (WHERE pi.image_url IS NOT NULL),
    '[]'
) AS images
    FROM products p
    LEFT JOIN product_images pi 
        ON p.product_id = pi.product_id
    GROUP BY p.product_id
    ORDER BY p.posted_at DESC
    LIMIT ${quantity};
  `;

      const { rows } = await postgreSql.query(query);

      if (rows.length === 0) return undefined;

      const products = rows.map((product) => ({
        ...product,
        images: product.images.map(
          (url: string) => `http://localhost:3001/productPhotos/${url}`
        ),
      }));

      return products;
    } catch (error) {
      throw ApiError.internal("Unexpected error occured while finding chats");
    }
  }

  static async findById(id: string): Promise<Product | undefined> {
    try {
      const query = `
    SELECT 
        p.product_id AS "productId",
        p.user_id AS "userId",
        p.name,
        p.category,
        p.description,
        p.location,
        p.price,
        p.condition,
        p.trade_possible AS "tradePossible",
        to_char(p.posted_at, 'DD.MM.YYYY') AS "formattedDateTime",
        json_build_object(
            'email', p.email,
            'phoneNumber', p.phone_number
        ) AS "contactDetails",
       COALESCE(
    json_agg(pi.image_url ORDER BY pi.position) FILTER (WHERE pi.image_url IS NOT NULL),
    '[]'
) AS images
    FROM products p
    LEFT JOIN product_images pi 
        ON p.product_id = pi.product_id
    WHERE p.product_id = $1
    GROUP BY p.product_id
    LIMIT 1;
  `;
      const values = [id];
      const { rows } = await postgreSql.query(query, values);

      if (rows.length === 0) return undefined;

      return rows[0] as Product;
    } catch (error) {
      throw ApiError.internal(
        "Unexpected error during finding product by id: occured"
      );
    }
  }

  static async findManyById(ids: string[]): Promise<Product[] | undefined> {
    try {
      const query = `
    SELECT 
        p.product_id AS "productId",
        p.user_id AS "userId",
        p.name,
        p.category,
        p.description,
        p.location,
        p.price,
        p.condition,
        p.trade_possible AS "tradePossible",
        to_char(p.posted_at, 'DD.MM.YYYY') AS "formattedDateTime",
        json_build_object(
            'email', p.email,
            'phoneNumber', p.phone_number
        ) AS "contactDetails",
       COALESCE(
    json_agg(pi.image_url ORDER BY pi.position) FILTER (WHERE pi.image_url IS NOT NULL),
    '[]'
) AS images

    FROM products p
    LEFT JOIN product_images pi 
        ON p.product_id = pi.product_id
    WHERE p.product_id = ANY($1)
    GROUP BY p.product_id
    ORDER BY p.posted_at DESC;
  `;

      const values = [ids]; // pass as array
      const { rows } = await postgreSql.query(query, values);

      if (rows.length === 0) return undefined;

      const products = rows.map((product) => ({
        ...product,
        images: product.images.map(
          (url: string) => `http://localhost:3001/productPhotos/${url}`
        ),
      }));

      return products;
    } catch (error) {
      throw ApiError.internal(
        "Unexpected error occured during finding products by id"
      );
    }
  }

  static async findByUserId(id: string): Promise<Product[] | undefined> {
    try {
      const query = `
    SELECT 
    p.product_id AS "productId",
    p.user_id AS "userId",
    p.name,
    p.category,
    p.description,
    p.location,
    p.price,
    p.condition,
    p.trade_possible AS "tradePossible",
    to_char(p.posted_at, 'DD.MM.YYYY') AS "formattedDateTime",
    json_build_object(
        'email', p.email,
        'phoneNumber', p.phone_number
    ) AS "contactDetails",
    COALESCE(
        json_agg(
            json_build_object(
                'url', pi.image_url,
                'position', pi.position
            ) ORDER BY pi.position
        ) FILTER (WHERE pi.image_url IS NOT NULL),
        '[]'
    ) AS images
FROM products p
LEFT JOIN product_images pi 
    ON p.product_id = pi.product_id
WHERE p.user_id = $1
GROUP BY p.product_id
ORDER BY p.posted_at DESC;

  `;

      const { rows } = await postgreSql.query(query, [id]);

      if (rows.length === 0) return undefined;

      const postedProducts = rows.map((product) => {
        const validLinksImages = product.images.map(
          (image: { url: string }) =>
            `http://localhost:3001/productPhotos/${image.url}`
        );

        return {
          ...product,
          images: validLinksImages,
        };
      });

      return postedProducts;
    } catch (error) {
      throw ApiError.internal(
        "Unexpected error occured during finding products by user id"
      );
    }
  }

  static async create(product: ProductInput): Promise<Product | undefined> {
    const client = await postgreSql.connect();
    try {
      await client.query("BEGIN");

      const { rows } = await client.query(
        `INSERT INTO products (
        user_id,
        name,
        category,
        description,
        location,
        price,
        condition,
        trade_possible,
        email,
        phone_number
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
      ) RETURNING *;`,
        [
          product.userId,
          product.name,
          product.category,
          product.description,
          product.location,
          product.price,
          product.condition,
          product.tradePossible,
          product.contactDetails.email,
          product.contactDetails.phoneNumber,
        ]
      );

      if (rows.length === 0) {
        throw ApiError.internal("Failed to create product");
      }

      const productId = rows[0].product_id;

      if (product.images.length > 0) {
        const placeholders: string[] = [];
        const values: string[] = [productId];

        product.images.forEach((imageUrl, index) => {
          placeholders.push(`($1, $${index + 2}, ${index + 1})`);
          values.push(imageUrl);
        });

        const query = `
        INSERT INTO product_images (product_id, image_url, position)
        VALUES ${placeholders.join(", ")}
        RETURNING *
      `;

        const imagesRes = await client.query(query, values);
        if (imagesRes.rows.length === 0)
          throw ApiError.internal(
            "Unexpected error occured during saving images"
          );
      }

      await client.query("COMMIT");
      return rows[0] ?? null;
    } catch (error) {
      await client.query("ROLLBACK");
      if (error instanceof ApiError) throw error;
      throw ApiError.internal("Unexpected error occured during saving product");
    } finally {
      client.release();
    }
  }

  static async remove(productId: string) {
    const client = await postgreSql.connect();

    try {
      await client.query("BEGIN");

      const imagesRes = await client.query(
        `SELECT image_url FROM product_images WHERE product_id = $1`,
        [productId]
      );

      if (imagesRes.rows.length === 0)
        throw ApiError.badRequest("Failed to find product images");

      const imageUrls: string[] = imagesRes.rows.map((row) => row.image_url);

      const deleteProductRes = await client.query(
        `DELETE FROM products WHERE product_id = $1 RETURNING *`,
        [productId]
      );

      if (deleteProductRes.rowCount === 0) {
        throw ApiError.badRequest(`Failed to delete product`);
      }

      for (const url of imageUrls) {
        const filePath = `${productPhotosDest}/${url}`;

        path.join(productPhotosDir, url);
        try {
          await fs.unlink(filePath);
        } catch (err: any) {
          if (err.code !== "ENOENT") {
            console.error(`Ошибка при удалении файла ${url}:`, err);
          }
        }
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Ошибка при удалении товара:", error);
      if (error instanceof ApiError) throw error;
      throw ApiError.internal(
        "Failed to remove product.Unexpected error occured"
      );
    } finally {
      client.release();
    }
  }

  static async findProducts(
    category?: string,
    location?: string,
    condition?: string,
    tradePossible?: boolean,
    priceMin?: number,
    priceMax?: number,
    name?: string
  ): Promise<Product[]> {
    try {
      const values: any[] = [];
      const conditions: string[] = [];

      if (category) {
        values.push(category.toLowerCase());
        conditions.push(`LOWER(p.category) = $${values.length}`);
      }

      if (location) {
        values.push(`%${location.toLowerCase()}%`);
        conditions.push(`LOWER(p.location) LIKE $${values.length}`);
      }

      if (condition) {
        values.push(condition.toLowerCase());
        conditions.push(`LOWER(p.condition) = $${values.length}`);
      }

      if (tradePossible !== undefined) {
        values.push(tradePossible);
        conditions.push(`p.trade_possible = $${values.length}`);
      }

      if (priceMin !== undefined) {
        values.push(priceMin);
        conditions.push(`p.price >= $${values.length}`);
      }

      if (priceMax !== undefined) {
        values.push(priceMax);
        conditions.push(`p.price <= $${values.length}`);
      }

      if (name) {
        values.push(`%${name.toLowerCase()}%`);
        conditions.push(`LOWER(p.name) LIKE $${values.length}`);
      }

      const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

      const query = `
    SELECT 
        p.product_id AS "productId",
        p.user_id AS "userId",
        p.name,
        p.category,
        p.description,
        p.location,
        p.price,
        p.condition,
        p.trade_possible AS "tradePossible",
        to_char(p.posted_at, 'DD.MM.YYYY') AS "formattedDateTime",
        json_build_object(
            'email', p.email,
            'phoneNumber', p.phone_number
        ) AS "contactDetails",
        COALESCE(
            json_agg(pi.image_url ORDER BY pi.position) FILTER (WHERE pi.image_url IS NOT NULL),
            '[]'
        ) AS images
    FROM products p
    LEFT JOIN product_images pi 
        ON p.product_id = pi.product_id
    ${whereClause}
    GROUP BY p.product_id
    ORDER BY p.posted_at DESC
  `;

      const { rows } = await postgreSql.query(query, values);

      if (rows.length === 0) return [];

      return rows.map((product) => ({
        ...product,
        images: product.images.map(
          (url: string) => `http://localhost:3001/productPhotos/${url}`
        ),
      }));
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.internal(
        "Unexpected error occured. Failed to find products"
      );
    }
  }
}
