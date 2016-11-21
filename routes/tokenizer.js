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
    res.send("Hello All");
};