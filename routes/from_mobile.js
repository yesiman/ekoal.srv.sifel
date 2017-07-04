
exports.uploadDatas = function (req, res) {
    var lines = req.body.lines;
    var success = true;
    for (var i = 0; i < lines.length; i++) {
        switch(lines[i].type)
        {
            case "parcelle":
                //SET MONGO GEO CORRECTLY "POLYGON"
                updParcelle(lines[i]._id,lines[i].surface,lines[i].altitude,lines[i].coordonnees,lines[i].code,lines[i].lib,lines[i].producteur)
                .then(function(value) {
                }).catch(function(e) {
                    success = false;
                }).then(function(e) {
                });
                break;
        }
    }

    res.send({success:success});
    
}

function updParcelle(id,surface,altitude,coordonnees,code,lib,producteur) {
    console.log(id + "-" + surface + "-" + altitude +"-" + coordonnees);
  return new Promise(function (resolve, reject) {
      db.collection('parcelles', function (err, collection) {
          if (id.startsWith("nu"))
          {
              var ins = {
                            user:new require('mongodb').ObjectID(req.decoded._id),
                            orga:new require('mongodb').ObjectID(req.decoded.orga),
                            producteur:new require('mongodb').ObjectID(producteur),
                            code:code,
                            lib:lib,
                            surface:surface,
                            altitude:altitude,
                            coordonnees:coordonnees
                        };
              collection.insert(i);
              console.log("insert");
          }
          else {
            collection.findOne({ _id: new require('mongodb').ObjectID(id) }, function (err, item) {
            if (item)
            {
                collection.update(
                    { _id: new require('mongodb').ObjectID(id) },
                    {
                        $set:{
                            code:code,
                            lib:lib,
                            surface:surface,
                            altitude:altitude,
                            coordonnees:coordonnees
                        }
                    }, 
                    { "upsert": true });
            }
            
        });    
          }
          
    });
  })
}
