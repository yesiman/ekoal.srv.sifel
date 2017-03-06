exports.get = function (req, res) {
    db.collection('products_rules', function (err, collection) {
        collection.findOne({ _id: new require('mongodb').ObjectID(req.params.id) }, function (err, item) {
            res.send(item);
        })
    });
};
exports.getAllByProduit = function (req, res) {
    var skip = (parseInt(req.params.idp) - 1) * parseInt(req.params.nbr);
    var limit = parseInt(req.params.nbr);
    //TODO ADD WORKFLOW RULES
    db.collection('products_rules', function (err, collection) {
        collection.count({produit:new require('mongodb').ObjectID(req.params.id),lib: { '$regex': req.params.req, $options: 'i' }}, function (err, count) {
            collection.find({produit:new require('mongodb').ObjectID(req.params.id),lib: { '$regex': req.params.req, $options: 'i' }}).skip(skip).limit(limit).toArray(function (err, items) {
                res.send({items:items,count:count});
            });
        });
    });
};
exports.delete = function (req, res) {
    db.collection('products_rules', function (err, collection) {
    collection.remove({ _id: new require('mongodb').ObjectID(req.params.id) },
        function (err, result) {
            res.send(result);
        });
    });
};
exports.add = function (req, res) {
    var pid = req.params.id;
    delete req.body.rule._id;
    req.body.rule.dateModif = new Date();
    req.body.rule.user = new require('mongodb').ObjectID(req.decoded._id);
    req.body.rule.produit = new require('mongodb').ObjectID(req.body.rule.produit);
    //var lines = req.body.planif.lines;
    //var linesToRem = req.body.rule.linesToRem;
    db.collection('products_rules', function (err, collection) {
        if (pid == "-1")
        {
            collection.insert( req.body.rule , function (err, saved) {
                if (err || !saved) {
                    res.send({res:false})
                }
                else {
                    res.send({res:true,nid:saved.insertedIds[0]});
                }
            });
        }
        else {
            collection.update(
                { _id: new require('mongodb').ObjectID(pid) },
                req.body.rule);
                res.send(true);
        }    
    });
};