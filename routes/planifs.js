exports.get = function (req, res) {
    var planif;
    db.collection('planifs', function (err, collection) {
        collection.findOne({ _id: new require('mongodb').ObjectID(req.params.id) }, function (err, item) {
            planif = item;
            db.collection('products', function (err, collection) {
                collection.findOne({ _id: new require('mongodb').ObjectID(planif.produit) }, function (err, item) {
                    planif.produit = item;
                    db.collection('users', function (err, collection) {
                        collection.findOne({ _id: new require('mongodb').ObjectID(planif.producteur), type:4 }, function (err, item) {
                            planif.producteur = item;
                            db.collection('planifs_lines', function (err, collection) {
                                collection.find({planif: new require('mongodb').ObjectID(planif._id)}).toArray(function (err, items) {
                                    planif.lines = items;
                                    if (planif.parcelle)
                                    {
                                        db.collection('parcelles', function (err, collection) {
                                            collection.findOne({ _id: new require('mongodb').ObjectID(planif.parcelle)}, function (err, item) {
                                                planif.parcelle = item;
                                                res.send(planif);
                                            });
                                        }); 
                                    }
                                    else {
                                        res.send(planif);
                                    }
                                });
                            });       
                        })
                    });
                })
            });
        })
    });
};
exports.add = function (req, res) {
    var pid = req.params.id;
    req.body.planif.dateModif = new Date();
    req.body.planif.produit = new require('mongodb').ObjectID(req.body.planif.produit);
    req.body.planif.producteur = new require('mongodb').ObjectID(req.body.planif.producteur);
    if(req.body.parcelle)
    {
        req.body.parcelle = new require('mongodb').ObjectID(req.body.planif.parcelle);
    }
    var lines = req.body.planif.lines;
    var linesToRem = req.body.planif.linesToRem;
    delete req.body.planif.lines;
    delete req.body.planif.linesToRem;
    db.collection('planifs', function (err, collection) {
        if (pid == "-1")
        {
            collection.insert( req.body.planif , function (err, saved) {
                if (err || !saved) {
                    //res.send(false)
                }
                else {
                    pid = saved.insertedIds[0];
                    db.collection('planifs_lines', function (err, collection) {
                        for (var i = 0; i < lines.length; i++) {
                            delete lines[i].id;
                            lines[i].planif = new require('mongodb').ObjectID(pid);
                            lines[i].dateRec = new Date(lines[i].dateRec);
                            lines[i].produit = req.body.planif.produit;
                            lines[i].producteur = req.body.planif.producteur;
                            collection.insert(lines[i], function (err, saved) { });
                        }
                    });
                }
            });
        }
        else {
            delete req.body.planif._id;
            
            collection.update(
                { _id: new require('mongodb').ObjectID(pid) },
                req.body.planif, // options
                function(err, object) {
                    if (err){
                        //console.warn(err.message);  // returns error if no matching object found
                    }else{
                        //console.dir(object);
                        console.log(lines);
                        db.collection('planifs_lines', function (err, collection) {
                            for (var i = 0; i < lines.length; i++) {
                                lines[i].planif = new require('mongodb').ObjectID(pid);
                                lines[i].dateRec = new Date(lines[i].dateRec);
                                lines[i].produit = req.body.planif.produit;
                                lines[i].producteur = req.body.planif.producteur;
                                if (lines[i]._id)
                                {
                                    console.log("_id EXIST");
                                    var lid = lines[i]._id;
                                    delete lines[i]._id;
                                    collection.update({_id:new require('mongodb').ObjectID(lid)},lines[i], function (err, object) { });
                                }
                                else {
                                    console.log("_id NOT EXIST");
                                    console.log("xxx",lines[i]);
                                    delete lines[i].id;
                                    collection.insert(lines[i], function (err, saved) { });
                                }
                            }
                            for (var i = 0; i < linesToRem.length; i++) {
                                linesToRem[i] = new require('mongodb').ObjectID(linesToRem[i]);
                            }
                            if(linesToRem.length > 0)
                            {
                                collection.remove({ _id : {$in:linesToRem}}, function (err, saved) { });
                            }
                        });
                    }
                });
            /*db.collection('planifs_lines', function (err, collection) {
                for (var i = 0; i < lines.length; i++) {
                    lines[i].planif = new require('mongodb').ObjectID(pid);
                    lines[i].dateRec = new Date(lines[i].dateRec);
                    lines[i].produit = req.body.planif.produit;
                    lines[i].producteur = req.body.planif.producteur;
                    if (lines[i]._id)
                    {
                        console.log(lines[i]._id + "/" + pid);
                        collection.update({_id:new require('mongodb').ObjectID(lines[i]._id)},lines[i], function (err, saved) { });
                    }
                    else {
                        delete lines[i].id;
                        collection.insert(lines[i], function (err, saved) { });
                    }
                }
                for (var i = 0; i < linesToRem.length; i++) {
                    linesToRem[i] = new require('mongodb').ObjectID(linesToRem[i]);
                }
                if(linesToRem.length > 0)
                {
                    collection.remove({ _id : {$in:linesToRem}}, function (err, saved) { });
                }
            });*/
        }
    });
    
    res.send(true)
};
exports.delete = function (req, res) {
    db.collection('planifs_lines', function (err, collection) {
        collection.remove({ planif: new require('mongodb').ObjectID(req.params.id) },
            function (err, result) {
                db.collection('planifs', function (err, collection) {
                    collection.remove({ _id: new require('mongodb').ObjectID(req.params.id) },
                        function (err, result) {
                            res.send(result);
                        });
                });
            });
    });
};
exports.getAll = function (req, res) {
    var skip = (parseInt(req.params.idp) - 1) * parseInt(req.params.nbr);
    var limit = parseInt(req.params.nbr);
    var ret = new Object();

    //ADD LIKE STATS WORKFLOW

    db.collection('planifs', function (err, collection) {
        collection.count({}, function (err, count) {
            ret.count = count;
            collection.find().skip(skip).limit(limit).toArray(function (err, items) {
                var produitsIds = [];
                var producteursIds = [];
                var planifs = [];
                var produits = [];
                var producteurs = [];
                planifs = items;
                for(var i=0;i<items.length;i++)
                {
                    if (!(produitsIds.indexOf(new require('mongodb').ObjectID(items[i].produit)) > -1))
                    {
                        produitsIds.push(new require('mongodb').ObjectID(items[i].produit));
                    }
                    if (!(producteursIds.indexOf(new require('mongodb').ObjectID(items[i].producteur)) > -1))
                    {
                        producteursIds.push(new require('mongodb').ObjectID(items[i].producteur));
                    }
                }
                //GET PRODUITS
                db.collection('products', function (err, collection) {
                    collection.find({_id: {$in:produitsIds}}).toArray(function (err, items) {
                        produits = items;
                        //GET PRODUCTEURS
                        db.collection('users', function (err, collection) {
                            collection.find({_id: {$in:producteursIds}}).toArray(function (err, items) {
                                producteurs = items;
                                for(var i=0;i<planifs.length;i++)
                                {
                                    for(var ip1=0;ip1<produits.length;ip1++)
                                    {
                                        if (produits[ip1]._id.toString() == planifs[i].produit.toString())
                                        {
                                            planifs[i].produitLib = produits[ip1].lib;
                                            break;
                                        }
                                    }
                                    for(var ip2=0;ip2<producteurs.length;ip2++)
                                    {
                                        if (producteurs[ip2]._id.toString() == planifs[i].producteur.toString())
                                        {
                                            planifs[i].producteurLib = producteurs[ip2].name + " " + producteurs[ip2].surn;
                                            break;
                                        }
                                    }
                                }
                                ret.items = planifs;
                                res.send(ret);
                            });
                        });        
                    });
                });
                //ASSIGN
                //SEND
            });
        });
    });
};