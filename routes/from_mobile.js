
exports.uploadDatas = function (req, res) {
    var lines = req.body.lines;
    for (var i = 0; i < lines.length; i++) {
        switch(lines[i].type)
        {
            case "parcelle":
                db.collection('parcelles', function (err, collection) {
                    //SET MONGOGEO CORRECTLY "POLYGON"
                   collection.findOne({ _id: new require('mongodb').ObjectID(lines[i]._id) }, function (err, item) {
                       if (item)
                       {
                           console.log("nualt",lines[i].altitude);
                           collection.update(
                            { _id: new require('mongodb').ObjectID(item._id) },
                            {
                                $set:{
                                    surface:lines[i].surface,
                                    altitude:lines[i].altitude,
                                    coordonnees:{ type: "Polygon", coordinates: lines[i].coordonnees}
                                }
                            }, 
                            { "upsert": true });
                       }
                   });
                    
                });
                break;
        }
    }
    res.send({success:true});
}