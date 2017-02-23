

exports.produits = function (req, res) {
    var lines = req.files[0].buffer.toString().split("\n");
    for (var i = 0; i < lines; i++) {
        console.log(lines[i]);
    }
    res.send(true);
}