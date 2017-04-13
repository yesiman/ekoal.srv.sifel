exports.get = function (req, res) {
    db.collection('orgas', function (err, collection) {
        collection.findOne({ _id: new require('mongodb').ObjectID(req.params.id) }, function (err, item) {
            res.send(item);
        })
    });
};
exports.getAll = function (req, res) {
    var skip = (parseInt(req.params.idp) - 1) * parseInt(req.params.nbr);
    var limit = parseInt(req.params.nbr);
    var ret = new Object();
    
    
    db.collection('users', function (err, collection) {
            collection.aggregate(
                {$match:{type:{$eq:4}}},
                {$group:{
                    _id:{orga:"$orga"},
                    count:{$sum:1}}
                },
                {},
                function(err, summary) {
                    console.log(err); 
                    console.log(summary); 
                    /*var prodsToGet = [];
                    for (var i = 0;i < summary.length;i++)
                    {
                        var found = false;
                        for (var ipg = 0;ipg < prodsToGet.length;ipg++)
                        {
                            if (prodsToGet[ipg].toString() == summary[i]._id.producteur.toString())
                            {
                                found = true;
                            }
                        }
                        if (!found)
                        {
                            prodsToGet.push(new require('mongodb').ObjectID(summary[i]._id.producteur.toString()));
                        }
                    }
                    db.collection('users', function (err, collection) {
                        collection.find({_id:{$in:prodsToGet} }).toArray(function (err, items) {
                            res.send({items:summary, producteurs:items });
                        });
                    });*/
                }
            ); 
    });
    
    db.collection('orgas', function (err, collection) {
        collection.count({}, function (err, count) {
            ret.count = count;
            collection.find().skip(skip).limit(limit).toArray(function (err, items) {
                ret.items = items;
                res.send(ret);
            });
        });
    });
};
exports.delete = function (req, res) {
    db.collection('orgas', function (err, collection) {
    collection.remove({ _id: new require('mongodb').ObjectID(req.params.id) },
        function (err, result) {
            res.send(result);
        });
    });
};
exports.add = function (req, res) {
    var pid = req.params.id;
    req.body.orga.dateModif = new Date();
    db.collection('orgas', function (err, collection) {
        if (pid == "-1")
        {
            collection.insert( req.body.orga , function (err, saved) {
                if (err || !saved) {
                    res.send(false)
                }
                else {
                    res.send(true);
                }
            });
        }
        else {
            delete req.body.orga._id;
            collection.update(
                { _id: new require('mongodb').ObjectID(pid) },
                req.body.orga);
                res.send(true);
        }      
    });
};