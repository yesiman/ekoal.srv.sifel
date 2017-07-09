
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
                    updBon(lines[i])
                    .then(function(value) {
                    }).catch(function(e) {
                        success = false;
                    }).then(function(e) {
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

function updBon(bon) {
    return new Promise(function (resolve, reject) {
        var pals = bon.palettes;
        delete(bon.palettes)
        db.collection('bons', function (err, collection) {
            if (bon._id.startsWith('nu_') == true)
            {  
                delete(bon._id);
                bon.dateModif = getReunionLocalDate();
                collection.insert( bon , function (err, saved) {
                    if (err || !saved) {
                        reject("err");
                    }
                    else {
                        var bid = new require('mongodb').ObjectID(saved.insertedIds[0]);
                        db.collection('bons_lines', function (err, collection) {
                            for (var relipal = 0;relipal<pals.length;relipal++)
                            {
                                delete(pals[relipal]._id);
                                collection.insert(pals[relipal]);
                            }
                        });
                    }
                });
            }
            else {
                collection.findOne({ _id: new require('mongodb').ObjectID(bon._id) }, function (err, item) {
                    if (item)
                    {
                        collection.update(
                            { _id: new require('mongodb').ObjectID(bon._id) },
                            {
                                bon
                            }, 
                            { "upsert": true });
                    }
                });    
            }  



            
        });
        
         console.log("--------------------");
        console.log("new bon arrive",bon);
        resolve("ok");
  })
}
