
exports.uploadDatas = function (req, res) {
    var lines = req.body.lines;
    var success = true;
    if (lines.length == 0)
    {
        res.send({success:true});
    }
    else {
        for (var i = 0; i < lines.length; i++) {
            switch(lines[i].type)
            {
                case "parcelle":
                    //SET MONGO GEO CORRECTLY "POLYGON"
                    updParcelle(lines[i]._id,lines[i].surface,lines[i].altitude,lines[i].coordonnees,lines[i].code,lines[i].lib,new require('mongodb').ObjectID(lines[i].producteur),new require('mongodb').ObjectID(req.decoded._id),new require('mongodb').ObjectID(req.decoded.orga))
                    .then(function(value) {
                    }).catch(function(e) {
                        success = false;
                    }).then(function(e) {
                    });
                    break;
                case "bon":
                    updBon(
                        lines[i]._id,
                        req.decoded._id,
                        req.decoded.orga,
                        lines[i].destination,
                        lines[i].producteur,
                        lines[i].station,
                        lines[i].noLta,
                        lines[i].signatures,
                        lines[i].remarques
                    )
                    .then(function(value) {
                        console.log("BBEURKKKK");
                        console.log("RESID.1",value);
                    }).catch(function(e) {
                        console.log("ERRORROROROOR",e);
                        success = false;
                    }).then(function(e) {
                        console.log("RESID.2",e);
                    });
                    break;
            }
            if (!success) {res.send({success:false});break;}
            if (i == lines.length-1)
            {
                res.send({success:true});
            }
        }
    }
}

function updParcelle(id,surface,altitude,coordonnees,code,lib,producteur,user,orga) {
    return new Promise(function (resolve, reject) {
        var ins = {
                dateModif:shared.getReunionLocalDate(),
                user:user,
                orga:orga,
                producteur:producteur,
                code:code,
                lib:lib,
                surface:surface,
                altitude:altitude,
                coordonnees:coordonnees,
                actif: true
            };
            console.log("insert",ins);
      db.collection('parcelles', function (err, collection) {
          if (id.startsWith('nu') == true)
          {  
              collection.insert(ins);
          }
          else {
            collection.findOne({ _id: new require('mongodb').ObjectID(id) }, function (err, item) {
                if (item)
                {
                    collection.update(
                        { _id: new require('mongodb').ObjectID(id) },
                        {
                            $set:{
                                dateModif:shared.getReunionLocalDate(),
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

function updBon(id,user,orga,destination,producteur,station,noLta,signatures,remarques) {
    return new Promise(function (resolve, reject) {
        var ins = {
            dateModif:shared.getReunionLocalDate(),
            user:new require('mongodb').ObjectID(user),
            orga:new require('mongodb').ObjectID(orga),
            destination:destination,
            producteur:new require('mongodb').ObjectID(producteur),
            station:new require('mongodb').ObjectID(station),
            noLta:noLta,
            signatures:signatures,
            remarques:remarques
            };
      db.collection('bons', function (err, collection) {
          if (id.startsWith('nu') == true)
          {  
              collection.insert( ins , function (err, saved) {
                resolve(saved.insertedIds[0])
            });
          }
          else {
            collection.findOne({ _id: new require('mongodb').ObjectID(id) }, function (err, item) {
                if (item)
                {
                    collection.update(
                        { _id: new require('mongodb').ObjectID(id) },
                        {
                            $set:{
                                dateModif:shared.getReunionLocalDate(),
                                user:new require('mongodb').ObjectID(user),
                                orga:new require('mongodb').ObjectID(orga),
                                destination:destination,
                                producteur:new require('mongodb').ObjectID(producteur),
                                station:new require('mongodb').ObjectID(station),
                                noLta:noLta,
                                signatures:signatures,
                                remarques:remarques
                            }
                        }, 
                        { "upsert": true });
                    resolve(id)
                }
            });    
        }  
    });
  })
}
