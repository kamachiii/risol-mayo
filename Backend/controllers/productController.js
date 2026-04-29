const Product = require("../models/Products");

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

