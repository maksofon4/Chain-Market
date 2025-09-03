import { promises as fs } from "fs";
import path from "path";
import { productPhotosDir } from "../config/env";
import { Product, ProductInput } from "../models/Product";
import postgreSql from "../../data/dataBase/postgre";

const productPhotosDest = `../${productPhotosDir}`;

export class ProductRepository {
  static async getRecentProducts(quantity: number): Promise<Product[]> {
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
            ) FILTER (WHERE pi.image_url IS NOT NULL), '[]'
        ) AS images
    FROM products p
    LEFT JOIN product_images pi 
        ON p.product_id = pi.product_id
    GROUP BY p.product_id
    ORDER BY p.posted_at DESC
    LIMIT ${quantity};
  `;

    const { rows } = await postgreSql.query(query);

    const newProducts = rows.map((product) => {
      const validLinksImages = product.images.map(
        (image: { url: string }) =>
          `http://localhost:3001/productPhotos/${image.url}`
      );

      return {
        ...product,
        images: validLinksImages,
      };
    });

    return newProducts;
  }

  static async findById(id: string): Promise<Product | null> {
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
    WHERE p.product_id = $1
    GROUP BY p.product_id
    LIMIT 1;
  `;

    const values = [id];
    const result = await postgreSql.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as Product;
  }

  static async findByUserId(id: string): Promise<Product[] | null> {
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
  }

  static async create(product: ProductInput): Promise<Product | null> {
    const client = await postgreSql.connect();
    try {
      await client.query("BEGIN");

      // 1. Вставляем сам продукт
      const productResult = await client.query(
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

      const productId = productResult.rows[0].product_id;

      // 2. Вставляем изображения, если есть
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
      `;

        await client.query(query, values);
      }

      await client.query("COMMIT");
      return productResult.rows[0] ?? null;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  static async remove(productId: string): Promise<boolean> {
    const client = await postgreSql.connect();

    try {
      await client.query("BEGIN");

      const imagesRes = await client.query(
        `SELECT image_url FROM product_images WHERE product_id = $1`,
        [productId]
      );

      const imageUrls: string[] = imagesRes.rows.map((row) => row.image_url);

      const deleteProductRes = await client.query(
        `DELETE FROM products WHERE product_id = $1 RETURNING *`,
        [productId]
      );

      if (deleteProductRes.rowCount === 0) {
        throw new Error(`Product with ID ${productId} not found.`);
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
      return true;
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Ошибка при удалении товара:", err);
      return false;
    } finally {
      client.release();
    }
  }

  // static async findProducts(
  //   category?: string,
  //   location?: string,
  //   condition?: string,
  //   tradePossible?: boolean,
  //   priceMin?: number,
  //   priceMax?: number,
  //   name?: string
  // ): Promise<Product[]> {
  //   const products = await this.getAllProducts();

  //   let filtered = products;

  //   if (category) {
  //     filtered = filtered.filter(
  //       (p) => p.category.toLowerCase() === String(category).toLowerCase()
  //     );
  //   }

  //   if (location) {
  //     filtered = filtered.filter((p) =>
  //       p.location.toLowerCase().includes(String(location).toLowerCase())
  //     );
  //   }

  //   if (condition) {
  //     filtered = filtered.filter(
  //       (p) => p.condition.toLowerCase() === String(condition).toLowerCase()
  //     );
  //   }

  //   if (tradePossible) {
  //     filtered = filtered.filter((p) => p.tradePossible === true);
  //   }

  //   if (tradePossible === false) {
  //     filtered = filtered.filter((p) => p.tradePossible === false);
  //   }

  //   if (priceMin) {
  //     filtered = filtered.filter((p) => p.price >= Number(priceMin));
  //   }

  //   if (priceMax) {
  //     filtered = filtered.filter((p) => p.price <= Number(priceMax));
  //   }

  //   if (name) {
  //     filtered = filtered.filter((p) =>
  //       p.name.toLowerCase().includes(String(name).toLowerCase())
  //     );
  //   }

  //   return filtered;
  // }
}
