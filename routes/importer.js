

exports.produits = function (req, res) {
    console.log("req.files",req.files);
    console.log("req.files.path",req.files[0].path);
    
    res.send(true);
}