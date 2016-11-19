exports.getUser = function (req, res) {
    //var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
    res.send("Hello" + req.params.id);
};
exports.getUsers = function (req, res) {
    //var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
    res.send("Hello All");
};