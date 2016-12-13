exports.add = function (req, res) {
    var pid = req.params.id;
    req.body.planif.dateModif = new Date();
    req.body.planif.produit = new require('mongodb').ObjectID(req.body.planif.produit);
    req.body.planif.producteur = new require('mongodb').ObjectID(req.body.planif.producteur);
    var lines = req.body.planif.lines;
    delete req.body.planif.lines;
    db.collection('planifs', function (err, collection) {
        if (pid == "-1")
        {
            collection.insert( req.body.planif , function (err, saved) {
                if (err || !saved) {
                    
                    //res.send(false)
                }
                else {
                    pid = saved.insertedIds[0];
                    db.collection('planifs_lines', function (err, collection) {
                        for (var i = 0; i < lines.length; i++) {
                            lines[i].planif = new require('mongodb').ObjectID(pid);
                            console.log(lines[i].dateRec);
                            lines[i].dateRec = lines[i].dateRec;
                            lines[i].produit = req.body.planif.produit;
                            lines[i].producteur = req.body.planif.producteur;
                            collection.insert(lines[i], function (err, saved) { });
                        }
                    });
                }
            });
        }
        else {
            delete req.body.planif._id;
            collection.update(
                { _id: new require('mongodb').ObjectID(pid) },
                req.body.planif);
                //res.send(true);
        }
    });
    
    res.send(true)
};
exports.delete = function (req, res) {
    db.collection('planifs_lines', function (err, collection) {
        collection.remove({ planif: new require('mongodb').ObjectID(req.params.id) },
            function (err, result) {
                db.collection('planifs', function (err, collection) {
                    collection.remove({ _id: new require('mongodb').ObjectID(req.params.id) },
                        function (err, result) {
                            res.send(result);
                        });
                });
            });
    });
};
exports.getAll = function (req, res) {
    var skip = (parseInt(req.params.idp) - 1) * parseInt(req.params.nbr);
    var limit = parseInt(req.params.nbr);
    var ret = new Object();
    db.collection('planifs', function (err, collection) {
        collection.count({}, function (err, count) {
            ret.count = count;
            collection.find().skip(skip).limit(limit).toArray(function (err, items) {
                ret.items = items;
                res.send(ret);
            });
        });
    });
};