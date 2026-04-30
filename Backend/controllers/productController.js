const Product = require("../models/Products");
const validateFile = require("../utils/validator");

class ProductController {

  // GET ALL
  index(req, res) {
    Product.getAll((err, results) => {
      if(err){
        return res.json({message: "Gagal ambil data"});
      }

      res.json({
        message: "Berhasil ambil data",
        data: results
      });
    });
  }

  // GET BY ID
  show(req, res) {
    const {id} = req.params;
    Product.getById(id, (err, result) => {
        if(err){
            return res.json({message: "Data tidak ditemukan"});
        }
        res.json({
            message: "Detail Produk",
            data: result[0]
        });
    });
  }

  // CREATE
  store(req, res) {
    const data = req.body;
    
    // validasi untuk upload file
    const fileError = validateFile(req.file);
    if(fileError) {
      return res.json({message: fileError});
    }
    data.image_url = req.file.filename;

    Product.create(data, (err) => {
      if(err){
        return res.json({message: "Data gagal ditambahkan"});
      }
      res.json({
        message: "Data berhasil ditambah",
        data: data
      });
    });
  }

  // UPDATE
  update(req, res) {
    const {id} = req.params;
    const data = req.body;

    // validasi untuk upload file
    if(req.file) {
      const fileError = validateFile(req.file);
      if(fileError) {
        return res.json({message: fileError});
      }
    }
    data.image_url = req.file ? req.file.filename : null;

    Product.update(id, data, (err) => {
      if(err){
        return res.json({message: "Gagal mengubah data"});
      }
      res.json({
        message: "Data berhasil diubah"
      });
    });
  }

  // DELETE
  destroy(req, res) {
    const {id} = req.params;

    Product.delete(id, (err) => {
      if(err){
        return res.json({message: "Gagal menghapus data"});
      }
      res.json({
        message: "Data berhasil dihapus"
      });
    });
  }
  
}

module.exports = new ProductController();

