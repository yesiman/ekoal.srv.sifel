exports.login = function (req, res) {
    db.collection('users', function (err, collection) {
        collection.findOne({ email: req.body.user.login, pass: req.body.user.pass }, function (err, item) {
            if (item)
            {
                var token = jwt.sign(item, process.env.JWT, {
                    expiresIn: 1440
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
            if (item)
            {
                if (item.type == 4)// IF PRODUCTEUR
                {
                    //GET PARCELLES
                    db.collection('parcelles', function (err, collection) {
                        collection.find({producteur:new require('mongodb').ObjectID(req.params.id)}).toArray(function (err, items) {
                            item.parcelles = items;
                            res.send(item);
                        });
                    });
                }
                else {
                    res.send(item);
                }
            }
            
        })
    });
};
exports.getParcelles = function (req, res) {
    db.collection('users', function (err, collection) {
        collection.findOne({ _id: new require('mongodb').ObjectID(req.params.id) }, function (err, item) {
            if (item)
            {
                if (item.type == 4)// IF PRODUCTEUR
                {
                    //GET PARCELLES
                    db.collection('parcelles', function (err, collection) {
                        collection.find({producteur:new require('mongodb').ObjectID(req.params.id)}).toArray(function (err, items) {
                            var ret = {items:items};
                            res.send(ret);
                        });
                    });
                }
                else {
                    res.send(null);
                }
            }
            
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
        case  1:   //VOIT TOUT     
            break;
        case  2:   //VOIT TECH et Producteurs LIES OP
            filters = { type: {$gte: 3}, orga:new require('mongodb').ObjectID(req.decoded.orga) };
            break;
        case  3:  //VOIT Producteurs LIES OP
            var obj_ids = [];
            for(var i=0;i<req.decoded.producteurs.length;i++)
            {
                obj_ids.push(new require('mongodb').ObjectID(req.decoded.producteurs[i]));
            }
            filters = { type: {$gte: 4}, orga:new require('mongodb').ObjectID(req.decoded.orga), _id: {$in:obj_ids} };
            break;
        default:  //VOIT AUCUNS USER
            filters = { type: {$gte: 9999} };
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
exports.getAllByType = function (req, res) {
    var skip = (parseInt(req.params.idp) - 1) * parseInt(req.params.nbr);
    var limit = parseInt(req.params.nbr);
    var typ = parseInt(req.params.idt);
    var ret = new Object();
    var filters = { };
    switch (req.decoded.type)
    {
        case  1:   //VOIT TOUT     
            break;
        case  2:   //VOIT TECH et Producteurs LIES OP
            filters = { type: { $eq: typ }, orga:new require('mongodb').ObjectID(req.decoded.orga) };
            break;
        case  3:  //VOIT Producteurs LIES OP
            var obj_ids = [];
            for(var i=0;i<req.decoded.producteurs.length;i++)
            {
                obj_ids.push(new require('mongodb').ObjectID(req.decoded.producteurs[i]));
            }
            filters = { type: { $eq: typ }, orga:new require('mongodb').ObjectID(req.decoded.orga), _id: {$in:obj_ids} };
            break;
        default:  //VOIT AUCUNS USER
            filters = { type: {$gte: 9999} };
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
exports.getAllByOrga = function (req, res) {
    var skip = (parseInt(req.params.idp) - 1) * parseInt(req.params.nbr);
    var limit = parseInt(req.params.nbr);
    var orga = req.params.ido;
    var ret = new Object();
    //TYPE 4 et 
    var filters = { type: { $eq: 4 }, orga: new require('mongodb').ObjectID(orga) };
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
    var uid = req.params.id;
    req.body.user.dateModif = new Date();
    var parcelles = req.body.user.parcelles;
    delete req.body.user.parcelles;
    if (req.body.user.orga)
    {
        req.body.user.orga = new require('mongodb').ObjectID(req.body.user.orga);
    }
    db.collection('users', function (err, collection) {
        if (uid == "-1")
        {
            collection.insert(req.body.user, function (err, saved) {
                if (err || !saved) {
                    res.send(false)
                }
                else {
                    uid = saved.insertedIds[0];
                    db.collection('parcelles', function (err, collection) {
                        for (var i = 0; i < parcelles.length; i++) {
                            parcelles[i].producteur = new require('mongodb').ObjectID(uid);
                            delete parcelles[i].new;
                            collection.insert(parcelles[i], function (err, saved) { });
                        }
                    });
                    res.send(true);
                }
            });
        }
        else {
            delete req.body.user._id;
            collection.update(
                { _id: new require('mongodb').ObjectID(uid) },
                req.body.user, function (err, saved) {
                    db.collection('parcelles', function (err, collection) {
                        for (var i = 0; i < parcelles.length; i++) {
                            parcelles[i].producteur = new require('mongodb').ObjectID(uid);
                            if (parcelles[i].new) {
                                delete parcelles[i].new;
                                parcelles[i].producteur = new require('mongodb').ObjectID(uid);
                                collection.insert(parcelles[i], function (err, saved) { });
                            }
                            else {
                                var pid = parcelles[i]._id;
                                delete parcelles[i]._id;
                                collection.update(
                                { _id: new require('mongodb').ObjectID(pid) },
                                parcelles[i]);
                            }
                        }
                        res.send(true);
                    });
                 });
                //UPDATE PARECLLES / INSERT IF "NEW"
        }      
    });
};