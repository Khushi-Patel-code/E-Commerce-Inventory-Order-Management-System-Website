const axios = require("axios");
const pool = require("../db/connection");
exports.fetchAndSaveExternalProducts = async (req, res) => {
  try {
    // 1. Fetch from DummyJSON API
    const response = await axios.get("https://dummyjson.com/products?limit=20");
    const products = response.data.products;

    let inserted = 0;

    for (const p of products) {
      const sku = `EXT-${p.id}`;
      const name = p.title;
      const description = p.description;
      const price = p.price;
      const retail_price = p.price + 10;
      const category_name = p.category;

      // 2. Ensure category exists
      let [categoryRows] = await pool.query(
        "SELECT category_id FROM categories WHERE category_name = ?",
        [category_name]
      );

      let category_id;

      if (categoryRows.length === 0) {
        const [result] = await pool.query(
          "INSERT INTO categories (category_name) VALUES (?)",
          [category_name]
        );
        category_id = result.insertId;
      } else {
        category_id = categoryRows[0].category_id;
      }

      // 3. Insert into products (ignore duplicates by SKU)
      await pool.query(
        `INSERT IGNORE INTO products 
         (sku, product_name, description, category_id, price, retail_price)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [sku, name, description, category_id, price, retail_price]
      );

      inserted++;
    }

    res.json({
      message: `Successfully inserted ${inserted} external products.`,
    });

  } catch (err) {
    console.error("External API error:", err);
    res.status(500).json({ error: "Failed to fetch external products" });
  }
};
