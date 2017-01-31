exports.get = function (req, res) {
    db.collection('products_rules', function (err, collection) {
        collection.findOne({ _id: new require('mongodb').ObjectID(req.params.id) }, function (err, item) {
            res.send(item);
        })
    });
};
exports.getAllByProduit = function (req, res) {
    var ret = new Object();
    //TODO ADD WORKFLOW RULES
    db.collection('products_rules', function (err, collection) {
        collection.find({produit:new require('mongodb').ObjectID(req.params.id)}).toArray(function (err, items) {
            console.log(req.params.id);
            console.log(items);
            ret.items = items;
            res.send(ret);
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
                    res.send(false)
                }
                else {
                    res.send(true);
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