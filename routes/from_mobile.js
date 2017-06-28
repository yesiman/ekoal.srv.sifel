
exports.uploadDatas = function (req, res) {
    var lines = req.body.lines;
    for (var i = 0; i < lines.length; i++) {
        switch(lines[i].type)
        {
            case "parcelle":
                //SET MONGOGEO CORRECTLY "POLYGON"
                collection.findOne({ _id: new require('mongodb').ObjectID(lines[i]._id) }, function (err, item) {
                    if (item)
                    {
                        updParcelle(item._id,lines[i].surface,lines[i].altitude,{ type: "Polygon", coordinates: lines[i].coordonnees})
                    }
                });
                break;
        }
    }
    res.send({success:true});
}

function updParcelle(id,surface,altitude,coordonnees) {
  return new Promise(function (resolve, reject) {
      db.collection('parcelles', function (err, collection) {
        collection.update(
            { _id: new require('mongodb').ObjectID(id) },
            {
                $set:{
                    surface:surface,
                    altitude:altitude,
                    coordonnees:coordonnees
                }
            }, 
            { "upsert": true });
        });
  })
}
