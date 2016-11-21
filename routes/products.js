exports.get = function (req, res) {

    //var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
    res.send("Hello" + req.params.id);
};
exports.getAll = function (req, res) {
    //var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
    res.send("Hello All");
};
exports.delete = function (req, res) {
    //var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
    res.send("Hello All");
};
exports.add = function (req, res) {
    //var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
    db.collection('products', function (err, collection) {
        collection.insert( req.params.product , function (err, saved) {
            if (err || !saved) {
                res.send(false)
            }
            else {
                res.send(true);
            }
        });
    });
};