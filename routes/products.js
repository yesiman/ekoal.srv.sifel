exports.get = function (req, res) {

    //var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
    res.send("Hello" + req.params.id);
};
exports.getAll = function (req, res) {
    //var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
    var skip = (parseInt(req.params.idp) - 1) * parseInt(req.params.nbr);
    var limit = parseInt(req.params.nbr);
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
        collection.insert( req.body.product , function (err, saved) {
            if (err || !saved) {
                res.send(false)
            }
            else {
                res.send(true);
            }
        });
    });
};