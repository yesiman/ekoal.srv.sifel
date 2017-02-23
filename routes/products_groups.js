exports.get = function (req, res) {
    db.collection('products_groups', function (err, collection) {
        collection.findOne({ _id: new require('mongodb').ObjectID(req.params.id) }, function (err, item) {
            res.send(item);
        })
    });
};
exports.getAll = function (req, res) {
    var skip = (parseInt(req.params.idp) - 1) * parseInt(req.params.nbr);
    var limit = parseInt(req.params.nbr);
    var ret = new Object();
    db.collection('products_groups', function (err, collection) {
        collection.count({orga:new require('mongodb').ObjectID(req.decoded.orga)}, function (err, count) {
            ret.count = count;
            collection.find({orga:new require('mongodb').ObjectID(req.decoded.orga)}).skip(skip).limit(limit).toArray(function (err, items) {
                ret.items = items;
                res.send(ret);
            });
        });
    });
};
exports.delete = function (req, res) {
    db.collection('products_groups', function (err, collection) {
    collection.remove({ _id: new require('mongodb').ObjectID(req.params.id) },
        function (err, result) {
            res.send(result);
        });
    });
};
exports.add = function (req, res) {
    var pid = req.params.id;
    req.body.group.dateModif = new Date();
    db.collection('products_groups', function (err, collection) {
        if (pid == "-1")
        {
            collection.insert( req.body.group , function (err, saved) {
                if (err || !saved) {
                    res.send(false)
                }
                else {
                    res.send(true);
                }
            });
        }
        else {
            delete req.body.group._id;
            collection.update(
                { _id: new require('mongodb').ObjectID(pid) },
                req.body.group);
                res.send(true);
        }      
    });
};