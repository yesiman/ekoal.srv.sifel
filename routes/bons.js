exports.get = function (req, res) {
    var ret = {};
    //GET BON
    db.collection('bons', function (err, collection) {
        collection.findOne({ 
            _id: new require('mongodb').ObjectID(req.params.id),
            orga:new require('mongodb').ObjectID(req.decoded.orga) }, 
        function (err, item) {
            ret = item;
            //GET STATION
            db.collection('stations', function (err, collection) {
                collection.findOne({ 
                    _id: new require('mongodb').ObjectID(ret.station),
                    orga:new require('mongodb').ObjectID(req.decoded.orga) }, 
                function (err, item) {
                    ret.station = item;
                    //GET PRODUCTEUR
                    db.collection('users', function (err, collection) {
                        collection.findOne({ 
                            _id: new require('mongodb').ObjectID(ret.producteur),
                            orga:new require('mongodb').ObjectID(req.decoded.orga) }, 
                        function (err, item) {
                            ret.producteur = item;
                            for(var relipal=0;relipal<ret.palettes.length;relipal++)
                            {
                                var pal = ret.palettes[relipal];
                                for(var reliprod=0;reliprod<pal.produits.length;reliprod++)
                                {
                                    var prod = pal.produits[reliprod];
                                    db.collection('produits', function (err, collection) {
                                        collection.findOne({ 
                                            _id: new require('mongodb').ObjectID(prod.produit),
                                            orga:new require('mongodb').ObjectID(req.decoded.orga) }, 
                                            function (err, item) {
                                                prod.produit = item;
                                            });
                                    });
                                    pal.produits[reliprod] = prod;
                                }
                                ret.palettes[relipal] = pal;
                            }
                            console.log(JSON.stringify(ret));
                            res.send(ret);
                        })
                    });
                })
            });
        })
    });
};
exports.getAll = function (req, res) {
    var skip = (parseInt(req.params.idp) - 1) * parseInt(req.params.nbr);
    var limit = parseInt(req.params.nbr);
    var ret = new Object();
    var filters = {orga:new require('mongodb').ObjectID(req.decoded.orga)};
    db.collection('bons', function (err, collection) {
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
    db.collection('bons', function (err, collection) {
    collection.remove({ _id: new require('mongodb').ObjectID(req.params.id) },
        function (err, result) {
            res.send(result);
        });
    });
};
exports.add = function (req, res) {
    var pid = req.params.id;
    req.body.bon.dateModif = shared.getReunionLocalDate();
    req.body.bon.user = new require('mongodb').ObjectID(req.decoded._id);
    req.body.bon.orga =  new require('mongodb').ObjectID(req.decoded.orga);
    db.collection('bons', function (err, collection) {
        if (pid == "-1")
        {
            req.body.bon.dateCreation = shared.getReunionLocalDate();
            collection.insert( req.body.bon , function (err, saved) {
                if (err || !saved) {
                    res.send(false)
                }
                else {
                    res.send(true);
                }
            });
        }
        else {
            delete req.body.bon._id;
            collection.update(
                { _id: new require('mongodb').ObjectID(pid) },
                req.body.bon);
                res.send(true);
        }      
    });
};