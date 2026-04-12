class userController{
    index(req, res) {
        res.send("Menampilkan Daftar User");
    }

    store(req, res) {
        res.send("Menambahkan User Baru");
    }

    update(req, res) {
        const {id} = req.params;
        res.send(`Mengedit Data User ${id}`);
    }

    destroy(req, res) {
        const {id} = req.params;
        res.send(`Menghapus Data User ${id}`);
    }
}

const object = new userController();
module.exports = object;