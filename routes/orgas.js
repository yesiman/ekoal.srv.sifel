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
    
    db.collection('orgas', function (err, collection) {
        collection.count({}, function (err, count) {
            ret.count = count;
            collection.find().skip(skip).limit(limit).toArray(function (err, items) {
                ret.items = items;
                var orgasIds = [];
                for (var i = 0;i < items.length;i++)
                {
                    orgasIds.push(new require('mongodb').ObjectID(items[i]._id));
                }
                db.collection('users', function (err, collection) {
                    var query = {};
                    var group = {};
                    var sort = {};
                    query["$match"] = {};
                    query["$match"]["type"] = { "$eq":4 };
                    query["$match"]["orga"] = { "$in":orgasIds };
                    group["$group"] = {};
                    group["$group"]["_id"] = {};
                    group["$group"]["_id"]["orga"] = "$orga";
                    group["$group"]["count"] = {"$sum":1};
                    collection.aggregate(
                        query,
                        group,
                        function(err, summary) {
                            for (var i = 0;i < summary.length;i++)
                            {
                                for (var ipg = 0;ipg < ret.items.length;ipg++)
                                {
                                    if (ret.items[ipg]._id.toString() == summary[i]._id.orga.toString())
                                    {
                                        ret.items[ipg].nbOrgas = summary[i].count;
                                    }
                                }
                            }
                        }
                    ); 
                });
                
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