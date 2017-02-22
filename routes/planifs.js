exports.get = function (req, res) {
    var planif;
    db.collection('planifs', function (err, collection) {
        collection.findOne({ _id: new require('mongodb').ObjectID(req.params.id) }, function (err, item) {
            planif = item;
            db.collection('products', function (err, collection) {
                collection.findOne({ _id: new require('mongodb').ObjectID(planif.produit) }, function (err, item) {
                    planif.produit = item;
                    db.collection('products_objectifs', function (err, collection) {
                        collection.findOne({ produit: new require('mongodb').ObjectID(planif.produit._id), user: new require('mongodb').ObjectID(req.decoded._id) }, function (err, item) {
                            planif.produit.objectif = item;
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
                        });
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
    if(req.body.planif.parcelle)
    {
        req.body.planif.parcelle = new require('mongodb').ObjectID(req.body.planif.parcelle);
    }
    if(req.body.planif.rule)
    {
        req.body.planif.rule = new require('mongodb').ObjectID(req.body.planif.rule);
    }
    var lines = req.body.planif.lines;
    var linesToRem = req.body.planif.linesToRem;
    delete req.body.planif.linesToRem;
    delete req.body.planif.lines;

    //GENERER PLANNING PAR JOUR
    var startDate = new Date(req.body.planif.dateRecStart);
    var surfacePercent = ((100/1)*req.body.planif.surface) / 100;

    //PASSAGE TOUTES LIGNES EN A SUPPRIMER
    /*for (var i = 0;i < req.body.planif.linesWeeks.length;i++)
    { 
        var valueQte = (req.body.planif.linesWeeks[i].percent/100) * req.body.planif.rendement; //PRODUCT DEFAULT RENDEMENT
        valueQte = valueQte / 7;
        for (var ir = 1;ir <= 7;ir++)
        {
            var d = new Date(startDate);
            var oIt = { 
                dateRec:d,
                qte:valueQte*surfacePercent
            }
            lines.push(oIt);
            startDate.setDate(d.getDate() + 1);
        } 
    }*/
    delete req.body.planif.linesWeeks;
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
                            lines[i].produit = new require('mongodb').ObjectID(req.body.planif.produit);
                            lines[i].producteur = new require('mongodb').ObjectID(req.body.planif.producteur);
                            lines[i].startAt = new Date(lines[i].startAt);
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
                        db.collection('planifs_lines', function (err, collection) {
                            collection.remove({ planif: new require('mongodb').ObjectID(pid) },
                                function (err, result) {
                                    for (var i = 0; i < lines.length; i++) {
                                        delete lines[i].id;
                                        lines[i].planif = new require('mongodb').ObjectID(pid);
                                        lines[i].produit = new require('mongodb').ObjectID(req.body.planif.produit);
                                        lines[i].producteur = new require('mongodb').ObjectID(req.body.planif.producteur);
                                        lines[i].startAt = new Date(lines[i].startAt);
                                        collection.insert(lines[i], function (err, saved) { });
                                    }
                                    if (linesToRem)
                                    {
                                        if(linesToRem.length > 0)
                                        {
                                            for (var i = 0; i < linesToRem.length; i++) {
                                                linesToRem[i] = new require('mongodb').ObjectID(linesToRem[i]);
                                            }
                                            collection.remove({ _id : {$in:linesToRem}});
                                        }
                                    }
                                }
                            );
                            
                            
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
                db.collection('planifs_lines_alerts', function (err, collection) {
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
            });
    });
};
exports.getAll = function (req, res) {
    var skip = (parseInt(req.params.idp) - 1) * parseInt(req.params.nbr);
    var limit = parseInt(req.params.nbr);
    var ret = new Object();

    var collect = "";
    var usersFilter = {};
    switch (req.decoded.type)
    {
        case  1:   //VOIT TOUT CE QUI EST PUBLIC
            producteurs = [];
            usersFilter = { public: true };
            collect = "products";
            break;
        case  2:   //FILTRE SUR PLANIFS PRODUCTEURS LIES
            usersFilter = { orga: new require('mongodb').ObjectID(req.decoded.orga), type: { $eq: 4 } };
            collect = "users";
            break;
        case 3:  //FILTRE SUR PLANIFS PRODUCTEURS LIES
        case 4:
            usersFilter = { _id: new require('mongodb').ObjectID(req.decoded._id) };
            collect = "users";
    }
    db.collection(collect, function (err, collection) {
        console.log("req.body.produits",);
        console.log("req.body.producteurs",req.body.producteurs);
        collection.find(usersFilter).toArray(function (err, items) {
            db.collection('planifs', function (err, collection) {
                var producteurs = [];
                var produits = [];
                var producteursUiFilters = [];
                var produitsUiFilters = [];
                for(var i=0;i<req.body.produits.length;i++)
                {
                    produitsUiFilters.push(new require('mongodb').ObjectID(req.body.produits[i]));
                }
                for(var i=0;i<req.body.producteurs.length;i++)
                {
                    producteursUiFilters.push(new require('mongodb').ObjectID(req.body.producteurs[i]));
                }
                var finalFilter;
                switch (req.decoded.type)
                {
                    case  1:   //VOIT TOUT CE QUI EST PUBLIC
                        for(var i1=0;i1<items.length;i1++)
                        {
                            produits.push(new require('mongodb').ObjectID(items[i1]._id));
                        }
                        finalFilter = { produit:{$in:produits} };
                        break;
                    case  2:   //FILTRE SUR PLANIFS PRODUCTEURS LIES
                        for(var i1=0;i1<items.length;i1++)
                        {
                            producteurs.push(new require('mongodb').ObjectID(items[i1]._id));
                        }
                        if (producteursUiFilters.length > 0)
                        {finalFilter = { producteur:{$in:producteursUiFilters} };} else {finalFilter = { producteur:{$in:producteurs} };}
                        
                        break;
                    case  3:  //FILTRE SUR PLANIFS PRODUCTEURS LIES
                        for(var i1=0;i1<items.length;i1++)
                        {
                            for(var i=0;i<items[i1].producteurs.length;i++)
                            {
                                producteurs.push(new require('mongodb').ObjectID(items[i1].producteurs[i]));
                            }
                        }
                        if (producteursUiFilters.length > 0)
                        {finalFilter = { producteur:{$in:producteursUiFilters} };} else {finalFilter = { producteur:{$in:producteurs} };}
                        
                        break;
                    case 4:  //FILTRE SUR SES DONNEES
                        producteurs.push(new require('mongodb').ObjectID(req.decoded._id));
                        finalFilter = { producteur:{$in:producteurs} };
                }
                
                if (producteursUiFilters.length > 0)
                {
                    finalFilter.produit = {$in:produitsUiFilters};
                }

                collection.count(finalFilter, function (err, count) {
                    ret.count = count;
                    collection.find(finalFilter).skip(skip).limit(limit).toArray(function (err, items) {
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
                                                    planifs[i].produitRend = produits[ip1].rendement;
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
        });  
    });
    
};