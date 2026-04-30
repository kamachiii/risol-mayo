function validateFile(file) {
    if(!file) return null;
    
    // validasi type ekstension
    const allowTypes = ['image/jpeg', 'image/png'];
    if(!allowTypes.includes(file.mimetype)){
        return "File harus berupa gambar (jpeg/png)";
    }

    // validasi size file
    if(file.size > 2 * 1024 * 1024){
        return "Ukuran file maksimal 2MB";
    }

    return null;
}

module.exports = validateFile;