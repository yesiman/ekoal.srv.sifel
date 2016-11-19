exports.findAll = function (req, res) {
    var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
    if (token) {
        firebase.auth().verifyIdToken(token).then(function (decodedToken) {
            var skip = (parseInt(req.params.idp) - 1) * parseInt(req.params.nbr);
            var limit = parseInt(req.params.nbr);
            client.search({
                index: 'firebase',
                type: 'part',
                sort: 'lib',
                from: skip,
                size: limit
            }).then(function (resp) {
                res.send(resp.hits);
            }, function (err) {
                res.send(err.message);
            });
        }).catch(function (error) {
            res.send(error);
        });
    }
    else {
        res.send("IT!");
    }
    
};
exports.save = function (req, res) {
    var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
    if (token) {
        firebase.auth().verifyIdToken(token).then(function (decodedToken) {
            var partsRef = firebase.database().ref('parts');
            if (req.body.part._id)
            {
                partsRef.child(req.body.part._id).set(req.body.part._source);
                res.send(req.body.part._id);
            }
            else {
                var newPartRef = partsRef.push();
                newPartRef.set(req.body.part._source);
                res.send(newPartRef.toString());
            }
            // We've appended a new message to the message_list location.
            
            
        }).catch(function (error) {
            res.send(error);
        });
    }
    else {
        res.send("IT!");
    }
};
exports.saveBook = function (req, res) {
    var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
    if (token) {
        firebase.auth().verifyIdToken(token).then(function (decodedToken) {
            var booksRef = firebase.database().ref('parts/' + req.body.part._id + '/books');
            //if (req.body.book._id) {
            //    partsRef.child(req.body.part._id).set(req.body.part._source);
            //    res.send(req.body.part._id);
            //}
            //else {
            var newBookRef = booksRef.push();
            newBookRef.set(req.body.book);
            res.send(newBookRef.toString());
            //}
        }).catch(function (error) {
            res.send(error);
        });
    }
    else {
        res.send("IT!");
    }
};