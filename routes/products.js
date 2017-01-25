exports.get = function (req, res) {
    db.collection('products', function (err, collection) {
        collection.findOne({ _id: new require('mongodb').ObjectID(req.params.id) }, function (err, item) {
            res.send(item);
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
                res.send(ret);
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
    custom.user = new require('mongodb').ObjectID(req.decoded._id);
    delete req.body.product.custom;
    req.body.product.dateModif = new Date();
    db.collection('products', function (err, collection) {
        if (pid == "-1")
        {
            collection.insert( req.body.product , function (err, saved) {
                if (err || !saved) {
                    res.send(false)
                }
                else {
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
            });
        }
        else {
            custom.produit = new require('mongodb').ObjectID(req.body.product._id);
            delete req.body.product._id;
            collection.update(
                { _id: new require('mongodb').ObjectID(pid) },
                req.body.product);
            collection.update(
                { produit: new require('mongodb').ObjectID(pid),user:new require('mongodb').ObjectID(req.decoded._id) },
                custom);
                res.send(true);
        }      
    });
};