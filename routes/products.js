exports.get = function (req, res) {
    var ret = {};
    db.collection('products', function (err, collection) {
        collection.findOne({ _id: new require('mongodb').ObjectID(req.params.id),orga:new require('mongodb').ObjectID(req.decoded.orga)}, function (err, item) {
            ret = item;
            db.collection('products_objectifs', function (err, collection) {
                collection.findOne({ user: new require('mongodb').ObjectID(req.decoded._id),produit:new require('mongodb').ObjectID(req.params.id) }, function (err, item) {
                    ret.objectif = item;
                    res.send(ret);
                })
            });
        })
    });
};
exports.getAll = function (req, res) {
    var skip = (parseInt(req.params.idp) - 1) * parseInt(req.params.nbr);
    var limit = parseInt(req.params.nbr);
    var ret = new Object();
    var filters = {
        orga:new require('mongodb').ObjectID(req.decoded.orga)
    };
    if (req.params.ts)
    {   
        var from = new Date(req.params.ts);
        console.log("TS PRESENT", req.params.ts);
        console.log("TS DATE", from);
        filters.dateModif = { $gte: from};
    }
    db.collection('products', function (err, collection) {
        collection.count(filters, function (err, count) {
            ret.count = count;
            collection.find(filters).skip(skip).limit(limit).toArray(function (err, items) {
                ret.items = items;
                res.send(ret);
            });
        });
    });
};
exports.getAllByLib = function (req, res) {
    var skip = (parseInt(req.params.idp) - 1) * parseInt(req.params.nbr);
    var limit = parseInt(req.params.nbr);
    var ret = new Object();
    var filters;

    if (req.decoded.type === 1)
    {
        filters = { orga:new require('mongodb').ObjectID(req.decoded.orga),lib: { '$regex': req.params.req, $options: 'i' }, public:true};
    }
    else {
        filters = { orga:new require('mongodb').ObjectID(req.decoded.orga),lib: { '$regex': req.params.req, $options: 'i' }};
    }

    if (req.params.actifs == "1")
    {
        filters["actif"] = true;
    }

    db.collection('products', function (err, collection) {
        collection.count(filters, function (err, count) {
            ret.count = count;
            collection.find(filters).skip(skip).limit(limit).toArray(function (err, items) {
                ret.items = items;
                var prods = [];
                for (var ip = 0;ip < items.length;ip++)
                {
                    prods.push(new require('mongodb').ObjectID(items[ip]._id));
                }
                //TODO REMOVE FROM HER EANDLOAD WHEN PROD SELECTED
                db.collection('products_objectifs', function (err, collection) {
                    collection.find({produit: {$in:prods}, user: new require('mongodb').ObjectID(req.decoded._id)}).skip(skip).limit(limit).toArray(function (err, items) {
                        for (var ii = 0;ii < ret.items.length;ii++)
                        {
                            for (var i = 0;i < items.length;i++)
                            {
                                if (items[i].produit.toString() == ret.items[ii]._id.toString())
                                {
                                    ret.items[ii].objectif = items[i];
                                    break;
                                }
                            }
                        }
                        res.send(ret);
                    });
                });
            });
        });
    });
};
exports.delete = function (req, res) {
    db.collection('products_rules', function (err, collection) {
        collection.remove({ produit: new require('mongodb').ObjectID(req.params.id) },
            function (err, result) {
                db.collection('products_objectifs', function (err, collection) {
                    collection.remove({ produit: new require('mongodb').ObjectID(req.params.id) },
                        function (err, result) {
                            db.collection('products', function (err, collection) {
                                collection.remove({ _id: new require('mongodb').ObjectID(req.params.id) },
                                    function (err, result) {
                                        res.send(result);
                                    });
                            });
                        });
                });
            });
    });
    //Supprimer données liées autre tables si besoin
};
exports.deleteGroup = function (req, res) {
    db.collection('products_groups', function (err, collection) {
        collection.remove({ produit: new require('mongodb').ObjectID(req.params.id) },
            function (err, result) {
                res.send(result);
            });
    });
    //Supprimer données liées autre tables si besoin
};
exports.add = function (req, res) {
    var pid = req.params.id;
    req.body.product.user = new require('mongodb').ObjectID(req.decoded._id);
    var objectif = {lines:req.body.product.objectif};
    objectif.user = new require('mongodb').ObjectID(req.decoded._id);
    delete req.body.product.objectif;    
    req.body.product.dateModif = shared.getReunionLocalDate();
    if (req.body.product.parent)
    {
        req.body.product.parent._id =  new require('mongodb').ObjectID(req.body.product.parent._id);
    }
    req.body.product.orga =  new require('mongodb').ObjectID(req.decoded.orga);
    db.collection('products', function (err, collection) {
        if (pid == "-1")
        {
            req.body.product.dateCreation = shared.getReunionLocalDate();
            collection.insert( req.body.product , function (err, saved) {
                if (err || !saved) {
                    res.send(false)
                }
                else {
                    if (objectif)
                    {
                        objectif.produit = new require('mongodb').ObjectID(saved.insertedIds[0]);
                        db.collection('products_objectifs', function (err, collection) {
                            collection.insert( objectif , function (err, saved) {
                                if (err || !saved) {
                                    res.send(false)
                                }
                                else {
                                    res.send(true);
                                }
                            });
                        });
                    }
                    else{
                        res.send(true);
                    }
                    
                }
            });
        }
        else {
            delete req.body.product._id;
            collection.update(
                { _id: new require('mongodb').ObjectID(pid) },
                req.body.product);
                db.collection('products_objectifs', function (err, collection) {
                    console.log(objectif);
                    
                        objectif.produit = new require('mongodb').ObjectID(pid);
                        var cid = objectif._id;
                        delete objectif._id;
                        collection.update(
                            { produit: new require('mongodb').ObjectID(pid) },
                            objectif, 
                            { "upsert": true },
                            function(err, results) {
                                res.send(true);
                            });
                        
                    /*}
                    else {
                        objectif.produit = new require('mongodb').ObjectID(pid);
                        collection.insert( objectif , function (err, saved) {
                            if (err || !saved) {
                                res.send(false)
                            }
                            else {
                                res.send(true);
                            }
                        });
                    }*/
                });
        }      
    });
};
//
exports.getAllFromDouane = function (req, res) {
    var level = parseInt(req.params.level);
    db.collection('douanes_products', function (err, collection) {
        var filters = {
            level:level
        };
        if (req.params.parent != "-1")
        {
            filters.parents = {
                $elemMatch:{$eq:req.params.parent}
            }
        }
        collection.find(filters).toArray(function (err, items) {
            var products = items;
            if (products.length > 0)
            {
                collection.find({code:{$in:products[0].parents}}).toArray(function (err, items) {
                    res.send({items:products,parents:items});
                });
            }
            else {
                res.send({items:products,parents:[]});
            }
        });
    });
};