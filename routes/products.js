exports.get = function (req, res) {
    console.log(req.params.id);
    db.collection('products', function (err, collection) {
        collection.findOne({ _id: new require('mongodb').ObjectID(req.params.id) }, function (err, item) {
            res.send(item);
        })
    });
};
exports.getAll = function (req, res) {
    //var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
    var skip = (parseInt(req.params.idp) - 1) * parseInt(req.params.nbr);
    var limit = parseInt(req.params.nbr);
    var ret = new Object();
    db.collection('products', function (err, collection) {
        collection.find().skip(skip).limit(limit).toArray(function (err, items) {
            ret.items = items;
            res.send(ret);
        });
    });
};
exports.delete = function (req, res) {
    //var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
    res.send("Hello All");
};
exports.add = function (req, res) {
    //var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
    db.collection('products', function (err, collection) {
        if (req.params.id == "-1")
        {
            collection.insert( req.body.product , function (err, saved) {
                if (err || !saved) {
                    res.send(false)
                }
                else {
                    res.send(true);
                }
            });
        }
        else {
            console.log("update id" + req.params.id);
            console.log("update data" + req.body.product);
            collection.update(
                { _id: new require('mongodb').ObjectID(req.params.id) },
                req.body.product);
                res.send(true);
        }
        
    });
};