const db = require("../config/database");

class Product {
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
        const sql = `INSERT INTO products (name, price, description) VALUES (?, ?, ?)`;
        db.query(sql, [
            data.name,
            data.price,
            data.description
        ], callback);
    }
    
    // update model data
    static update(id, data, callback) {
        const sql = `UPDATE products SET name=?, price=?, description=? WHERE id=?`;
        db.query(sql, [
            data.name,
            data.price,
            data.description,
            id
        ], callback);
    }

    // delete model data
    static delete(id, callback) {
        const sql = `DELETE FROM products WHERE id=?`;
        db.query(sql, [id], callback);
    }
}

module.exports = Product;