exports.sendMailRecover = function (req, res) {
    db.collection('users', function (err, collection) {
        collection.findOne({ email: req.body.mail }, function (err, item) {
            if (item) {

                res.send({ success: true });
            }
            else {
                res.send({ success: false });
            }

        })
    });
};