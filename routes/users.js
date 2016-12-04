exports.login = function (req, res) {
    db.collection('users', function (err, collection) {
        collection.findOne({ email: req.body.user.login, pass: req.body.user.pass }, function (err, item) {
            if (item)
            {
                var token = jwt.sign(item, process.env.JWT, {
                    expiresIn: 1440 // expires in 24 hours
                });
                res.send({success:true, name:item.name, surn:item.surn, type:item.type , token:token}); 
            }
            else {
                res.send({success:false});
            }
            
        })
    });

    
};
exports.get = function (req, res) {
    db.collection('users', function (err, collection) {
        collection.findOne({ _id: new require('mongodb').ObjectID(req.params.id) }, function (err, item) {
            res.send(item);
        })
    });
};
exports.getAll = function (req, res) {
    var skip = (parseInt(req.params.idp) - 1) * parseInt(req.params.nbr);
    var limit = parseInt(req.params.nbr);
    var ret = new Object();
    var filters = {};
    switch (req.decoded.type)
    {
        case  '1':        
            break;
        case  '2':
            filters = { type: {$gte: '1'} };
            break;
        default:
            ret.count = 0;
            ret.items = [];
            res.send(ret);
    }
    db.collection('users', function (err, collection) {
        collection.count(filters, function (err, count) {
            ret.count = count;
            collection.find(filters).skip(skip).limit(limit).toArray(function (err, items) {
                ret.items = items;
                res.send(ret);
            });
        });
    });
};
exports.delete = function (req, res) {
    db.collection('users', function (err, collection) {
    collection.remove({ _id: new require('mongodb').ObjectID(req.params.id) },
        function (err, result) {
            res.send(result);
        });
    });
};
exports.add = function (req, res) {
    var pid = req.params.id;
    req.body.product.dateModif = new Date();
    db.collection('users', function (err, collection) {
        if (pid == "-1")
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
            delete req.body.product._id;
            collection.update(
                { _id: new require('mongodb').ObjectID(pid) },
                req.body.product);
                res.send(true);
        }      
    });
};