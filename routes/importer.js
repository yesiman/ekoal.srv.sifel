

exports.produits = function (req, res) {
    var lines = req.files[0].buffer.toString().split("\n");
    db.collection('products', function (err, collection) {
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].split(";");
            var produit = {
                user:new require('mongodb').ObjectID(req.decoded._id),
                dateModif: new Date(),
                orga:new require('mongodb').ObjectID(req.decoded.orga),
                code:line[0],
                lib:line[1],
                rendement:{
                    val:0,
                    unit:2
                }
            };
            collection.insert(produit , function (err, saved) {
                
            });
        }
    });
    res.send(true);
}