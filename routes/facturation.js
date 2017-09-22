exports.get = function (req, res) {
    db.collection('factures', function (err, collection) {
        collection.findOne({ _id: new require('mongodb').ObjectID(req.params.id) }, function (err, item) {
            var facture = item;
            var colName;
            var idSearch;
            if (facture.type == '0')
            {
                idSearch = facture.client;
                colName = "clients";
            }
            else {
                idSearch = facture.producteur;
                colName = "users";
            }
            db.collection(colName, function (err, collection) {
                collection.findOne({ _id: new require('mongodb').ObjectID(idSearch) }, function (err, item) {
                    if (facture.type == '0')
                    {
                        facture.client = item;
                    }
                    else {
                        facture.producteur = item;
                    }res.send(facture);
                })
            });
        })
    });
};
exports.getAll = function (req, res) {
    var skip = (parseInt(req.params.idp) - 1) * parseInt(req.params.nbr);
    var limit = parseInt(req.params.nbr);
    var ret = new Object();
    
    db.collection('factures', function (err, collection) {
        collection.count({}, function (err, count) {
            ret.count = count;
            collection.find().skip(skip).limit(limit).toArray(function (err, items) {
                ret.items = items;
                var clisIds = [];
                var prodsIds = [];
                var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
                for (var i = 0;i < items.length;i++)
                {
                    if (items[i].client)
                    {
                        if (checkForHexRegExp.test(items[i].client))
                        {
                            clisIds.push(new require('mongodb').ObjectID(items[i].client));
                        }
                    }
                    if (items[i].producteur)
                    {
                        if (checkForHexRegExp.test(items[i].producteur))
                        {
                            prodsIds.push(new require('mongodb').ObjectID(items[i].producteur));
                        }
                    }
                }
                db.collection('clients', function (err, collection) {
                    collection.find({_id:{$in:clisIds}}).skip(skip).limit(limit).toArray(function (err, items) {
                        ret.clients = items;
                        db.collection('users', function (err, collection) {
                            collection.find({_id:{$in:prodsIds}}).skip(skip).limit(limit).toArray(function (err, items) {
                                ret.producteurs = items;
                                res.send(ret);
                            });
                        });
                    });
                });
            });
        });
    });
};
exports.delete = function (req, res) {
    db.collection('factures', function (err, collection) {
    collection.remove({ _id: new require('mongodb').ObjectID(req.params.id) },
        function (err, result) {
            res.send(result);
        });
    });
};
exports.add = function (req, res) {
    var pid = req.params.id;
    var facture = req.body.facture;
    facture.dateModif = shared.getReunionLocalDate();
    facture.user = new require('mongodb').ObjectID(req.decoded._id);
    if (facture.type == '0')
    {
        facture.client = new require('mongodb').ObjectID(facture.client);
    }
    else {
        facture.producteur = new require('mongodb').ObjectID(facture.producteur);
    }
    for(var i = 0;i < facture.bons.length;i++)
    {
        facture.bons[i] = new require('mongodb').ObjectID(facture.bons[i]);
    }
    var fid = facture._id;
    db.collection('factures', function (err, collection) {
        if (pid == "-1")
        {
            facture.dateCreation = shared.getReunionLocalDate();
            collection.insert( facture , function (err, saved) {
                fid = saved.insertedIds[0];
            });
        }
        else {
            delete facture._id;
            collection.update(
                { _id: new require('mongodb').ObjectID(pid) },
                facture);
        }
        //LOCK / UNLOCK BONS
        db.collection('bons', function (err, collection) {
            var upd;
            if (facture.type == '0')
            {
                upd = {$set:{"facturation.client":fid,multi:true}};
            }
            else {
                upd = {$set:{"facturation.producteur":fid,multi:true}};
            }
            collection.update(
                { _id: {$in:facture.bons} },
                upd, {multi:true}
                );
                res.send(true);
        });
    });
};