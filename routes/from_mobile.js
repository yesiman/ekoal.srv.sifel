//
exports.uploadDatas = function (req, res) {
    var lines = req.body.lines;
    var success = true;
    if (lines.length == 0)
    {
        res.send({success:true});
    }
    else {
        var nbParcs = 0;
        var nbBons = 0;
        var palettes;
        for (var i = 0; i < lines.length; i++) {
            switch(lines[i].type)
            {
                case "parcelle":
                    nbParcs++;
                    //SET MONGO GEO CORRECTLY "POLYGON"
                    updParcelle(lines[i]._id,lines[i].surface,lines[i].altitude,lines[i].coordonnees,lines[i].code,lines[i].lib,new require('mongodb').ObjectID(lines[i].producteur),new require('mongodb').ObjectID(req.decoded._id),new require('mongodb').ObjectID(req.decoded.orga))
                    .then(function(value) {
                    }).catch(function(e) {
                        success = false;
                    }).then(function(e) {
                    });
                    break;
                case "bon":
                    nbBons++;
                    var tbon = lines[i];
                    //palettes = lines[i].palettes;
                    updBonV2(
                        req.decoded._id,
                        req.decoded.orga,
                        tbon
                    )
                    .then(function(value) {
                        //for (var relipal = 0;relipal < palettes.length;relipal++)
                        //{
                        //    updBonLine(value,tbon.producteur,tbon.dateDoc,tbon.station,palettes[relipal]);
                        //}
                    }).catch(function(e) {
                        //console.log("err",e);
                        //success = false;
                    }).then(function(e) {
                    });
                    break;
            }
            if (!success) {
                res.send({success:false});break;
            }
            else {
                if (i == lines.length-1)
                {
                    if (nbBons > 0)
                    {
                        db.collection('orgas', function (err, collection) {
                            collection.findOne({ _id: new require('mongodb').ObjectID(req.decoded.orga) }, function (err, item) {
                                if (item) {
                                    var html = "Bonjour, <br/><br/>"
                                        + " De nouveaux bons ont étés synchronisés"
                                        + "A bientot";
                                    if (item.params)
                                    {
                                        mailing.sendMail(item.params.notifs.bon_new,"Nouveaux bons",html);
                                    }
                                }
                                res.send({success:true});
                            })
                        });
                    }
                    else {
                        res.send({success:true});
                    }
                }
            }
        }
    }
}
//
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
//
function updBon(id,user,orga,destination,producteur,station,noLta,signatures,remarques,dateDoc) {
    return new Promise(function (resolve, reject) {
        var ins = {
            dateModif:shared.getReunionLocalDate(),
            dateDoc:new Date(dateDoc),
            user:new require('mongodb').ObjectID(user),
            orga:new require('mongodb').ObjectID(orga),
            destination:destination,
            producteur:new require('mongodb').ObjectID(producteur),
            station:new require('mongodb').ObjectID(station),
            noLta:noLta,
            signatures:signatures,
            remarques:remarques
        };
        var inSign = signatures;
      db.collection('bons', function (err, collection) {
          if (id.startsWith('nu') == true)
          {  
              ///ADD SIGN DATA
              collection.insert( ins , function (err, saved) {
                  inSign.bon = saved.insertedIds[0];
                    resolve(inSign.bon);
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
                                remarques:remarques
                            }
                        }, 
                        { "upsert": true });
                    db.collection('bons_signatures', function (err, collection) {
                        collection.update(
                            { bon: new require('mongodb').ObjectID(id) },
                            {
                                signatures
                            }, 
                            { "upsert": true });
                        resolve(id);
                    });
                }
            });    
        }  
    });
  })
}
function updBonV2(user,orga,bon) {
    return new Promise(function (resolve, reject) {
        db.collection('bons', function (err, collection) {
            var id = bon._id;
            delete(bon._id);
            bon.dateModif = shared.getReunionLocalDate();
            bon.dateDoc = new Date(bon.dateDoc);
            bon.user = new require('mongodb').ObjectID(bon.user);
            bon.orga = new require('mongodb').ObjectID(bon.orga);
            bon.producteur = new require('mongodb').ObjectID(bon.producteur);
            bon.station = new require('mongodb').ObjectID(bon.station);
            for (var relipal = 0;relipal < bon.palettes.length;relipal++)
            {
                bon.palettes[relipal].condit = new require('mongodb').ObjectID(bon.palettes[relipal].condit);
                for (var reliprod = 0;reliprod < bon.palettes[relipal].produits.length;reliprod++)
                {
                    bon.palettes[relipal].produits[reliprod].produit = new require('mongodb').ObjectID(bon.palettes[relipal].produits[reliprod]._id);
                    bon.palettes[relipal].produits[reliprod].categorie = new require('mongodb').ObjectID(bon.palettes[relipal].produits[reliprod].categorie);   
                }
            }

            if (id.startsWith('nu') == true)
            {  
                ///ADD SIGN DATA
                collection.insert( bon , function (err, saved) {
                        resolve(saved.insertedIds[0]);
                        
                });
            }
            else {
                collection.findOne({ _id: new require('mongodb').ObjectID(id) }, function (err, item) {
                    if (item)
                    {
                        collection.update(
                            { _id: new require('mongodb').ObjectID(id) },
                            {
                                bon
                            }, 
                            { "upsert": true });
                    }
                    resolve("ok");
                });    
            }  
        });
        

        
        
    });
}
function updBonLine(bonId,producteur,dateDoc,station,palette) {
    return new Promise(function (resolve, reject) {
        palette.bon = new require('mongodb').ObjectID(bonId);
        palette.condit = new require('mongodb').ObjectID(palette.condit);
        palette.producteur = new require('mongodb').ObjectID(producteur);
        palette.station = new require('mongodb').ObjectID(station);
        palette.dateDoc = new Date(dateDoc);
        for (var reliprod = 0;reliprod < palette.produits.length;reliprod++)
        {
            delete(palette.produits[reliprod]._id);
            palette.produits[reliprod].categorie = new require('mongodb').ObjectID(palette.produits[reliprod].categorie);
            palette.produits[reliprod].produit = new require('mongodb').ObjectID(palette.produits[reliprod].produit);
        }
        var ins = palette;
        
        ins.dateModif = shared.getReunionLocalDate();
      db.collection('bons_lines', function (err, collection) {
          if (ins._id.startsWith('nu') == true)
          {  
              delete(ins._id);
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
//
