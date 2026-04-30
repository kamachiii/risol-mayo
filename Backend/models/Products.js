const db = require("../config/database");

class Products {
    static getAll(callback) {
        const sql = "SELECT * FROM products";
        db.query(sql, callback);
    }
    
    static getById(id, callback) {
        const sql = "SELECT * FROM products WHERE id = ?";
        db.query(sql, [id], callback);
    }

    // create model data
    static create(data, callback) {
        const sql = `
        INSERT INTO products (category_id, name, price, description, stock, image_url) 
        VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.query(sql, [
            data.category_id,
            data.name,
            data.price,
            data.description,
            data.stock,
            data.image_url
        ], callback);
    }
    
    // update model data
    static update(id, data, callback) {
        const sql = `UPDATE products SET category_id=?, name=?, price=?, description=?, stock=? WHERE id=?`;
        db.query(sql, [
            data.category_id,
            data.name,
            data.price,
            data.description,
            data.stock,
            id
        ], callback);
    }

    // delete model data
    static delete(id, callback) {
        const sql = `DELETE FROM products WHERE id=?`;
        db.query(sql, [id], callback);
    }
}

module.exports = Products;