exports.get = function (req, res) {
    var ret = {};
    db.collection('products', function (err, collection) {
        collection.findOne({ _id: new require('mongodb').ObjectID(req.params.id) }, function (err, item) {
            ret = item;
            db.collection('products_orgas_specs', function (err, collection) {
                collection.findOne({ user: new require('mongodb').ObjectID(req.decoded._id),produit:new require('mongodb').ObjectID(req.params.id) }, function (err, item) {
                    ret.custom = item;
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
    db.collection('products', function (err, collection) {
        collection.count({}, function (err, count) {
            ret.count = count;
            collection.find().skip(skip).limit(limit).toArray(function (err, items) {
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
        filters = { lib: { '$regex': req.params.req, $options: 'i' }, public:true};
    }
    else {
        filters = { lib: { '$regex': req.params.req, $options: 'i' }};
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
                db.collection('products_orgas_specs', function (err, collection) {
                    collection.find({produit: {$in:prods}, user: new require('mongodb').ObjectID(req.decoded._id)}).skip(skip).limit(limit).toArray(function (err, items) {
                        for (var ii = 0;ii < ret.items.length;ii++)
                        {
                            for (var i = 0;i < items.length;i++)
                            {
                                if (items[i].produit.toString() == ret.items[ii]._id.toString())
                                {
                                    ret.items[ii].customs = items[i];
                                }
                            }
                        }
                        
                        //ret.customs = items;
                        //console.log(items);
                        
                        res.send(ret);
                    });
                });
            });
        });
    });
};
exports.delete = function (req, res) {
    db.collection('products', function (err, collection) {
    collection.remove({ _id: new require('mongodb').ObjectID(req.params.id) },
        function (err, result) {
            res.send(result);
        });
    });
    //Supprimer données liées autre tables si besoin
};
exports.add = function (req, res) {
    var pid = req.params.id;
    var custom = req.body.product.custom;
    if (custom)
    {
        
        custom.user = new require('mongodb').ObjectID(req.decoded._id);
        delete req.body.product.custom;    
    }
    req.body.product.dateModif = new Date();
    db.collection('products', function (err, collection) {
        if (pid == "-1")
        {
            collection.insert( req.body.product , function (err, saved) {
                if (err || !saved) {
                    res.send(false)
                }
                else {
                    if (custom)
                    {
                        custom.produit = new require('mongodb').ObjectID(saved.insertedIds[0]);
                        db.collection('products_orgas_specs', function (err, collection) {
                            collection.insert( custom , function (err, saved) {
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
            custom.produit = new require('mongodb').ObjectID(req.body.product._id);
            delete req.body.product._id;
            collection.update(
                { _id: new require('mongodb').ObjectID(pid) },
                req.body.product);
                if (custom)
                {
                    db.collection('products_orgas_specs', function (err, collection) {
                        if (custom._id)
                        {
                            var cid = custom._id;
                            delete custom._id;
                            collection.update(
                                { _id: new require('mongodb').ObjectID(cid) },
                                custom);
                        }
                        else{
                            collection.insert( custom , function (err, saved) {
                            });
                        }
                    });
                }
                res.send(true);
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
        if (req.params.parent)
        {
            filters.parents = {
                $elemMatch:req.params.parent
            }
        }
        collection.find().toArray(function (err, items) {
            res.send(filters);
        });
    });
};