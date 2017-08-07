var Q = require('q');
//
function getProd(pid) {
    return new Promise(function(resolve,reject) {
        db.collection('products', function (err, collection) {
            collection.findOne({ _id: new require('mongodb').ObjectID(pid) }, 
                function (err, item) {
                    resolve(item);
                });
        });
    });
}
//
function getCat(cid) {
    return new Promise(function(resolve,reject) {
        db.collection('products_categs', function (err, collection) {
            console.log("cid",cid);
            collection.findOne({ _id: new require('mongodb').ObjectID(cid) }, 
                function (err, item) {
                    resolve(item);
                });
        });
    });
}
//
function getPalsProductsDatas(pals) {
    return new Promise(function (resolve, reject) {
        console.log("pals.bef",pals);
        var promises = [];
        pals.forEach(function(item,index){
            var p = item;
            p.produits.forEach(function(item,index){
                var promise = getProd(item.produit).then(function(data){
                    item.produit = data;
                    return Q(p);
                });
                promises.push(promise);
            });
        });
        Q.all(promises).then(function(data){
            resolve(data);
        });
    });
}
//
function getPalsCategsDatas(pals) {
    return new Promise(function (resolve, reject) {
        var promises = [];
        pals.forEach(function(item,index){
            var p = item;
            p.produits.forEach(function(item,index){
                var promise = getCat(item.categorie).then(function(data){
                    item.categorie = data;
                    return Q(p);
                });
                promises.push(promise);
            });
        });
        Q.all(promises).then(function(data){
            resolve(data);
        });
    });
}
//
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
                            getPalsProductsDatas(ret.palettes).then(function (data) {
                                ret.palettes = data;
                                getPalsCategsDatas(ret.palettes).then(function (data) {
                                    ret.palettes = data;
                                    res.send(ret);
                                });
                            });                             ;
                                
                                
                            /*for(var relipal=0;relipal<ret.palettes.length;relipal++)
                            {
                                var pal = ret.palettes[relipal];
                                for(var reliprod=0;reliprod<pal.produits.length;reliprod++)
                                {
                                    var prod = pal.produits[reliprod];
                                    db.collection('products', function (err, collection) {
                                        collection.findOne({ 
                                            _id: new require('mongodb').ObjectID(prod.produit),
                                            orga:new require('mongodb').ObjectID(req.decoded.orga) }, 
                                            function (err, item) {
                                                console.log(item);
                                                prod.produit = item;
                                            });
                                    });
                                    pal.produits[reliprod] = prod;
                                }
                                ret.palettes[relipal] = pal;
                                if (relipal == ret.palettes.length-1)
                                {
                                    console.log(ret);
                                    res.send(ret);
                                }
                            }*/
                            
                        })
                    });
                })
            });
        })
    });
};
//
exports.getAll = function (req, res) {
    var skip = (parseInt(req.params.idp) - 1) * parseInt(req.params.nbr);
    var limit = parseInt(req.params.nbr);
    var ret = new Object();
    var filters = {orga:new require('mongodb').ObjectID(req.decoded.orga)};
    if (req.body.lta && (req.body.lta.length > 0))
    {   
        filters.lta = { '$regex': req.body.lta, $options: 'i' };
    }
    db.collection('bons', function (err, collection) {
        collection.count(filters, function (err, count) {
            ret.count = count;
            collection.find(filters).skip(skip).limit(limit).toArray(function (err, items) {
                ret.items = items;
                for (var i = 0;i < items.length;i++)
                {
                    var st = items[i];
                    db.collection('stations', function (err, collection) {
                        collection.findOne({ 
                            _id: new require('mongodb').ObjectID(st.station)},
                        function (err, item) {
                            ret.items[i].station = item;
                            db.collection('users', function (err, collection) {
                                collection.findOne({ 
                                    _id: new require('mongodb').ObjectID(st.producteur)},
                                function (err, item) {
                                    ret.items[i].station = item;
                                    ret.producteur;
                                })
                            });
                        })
                    });
                    ret.items[i] = st;
                }
                res.send(ret);
            });
        });
    });
};
//
exports.delete = function (req, res) {
    db.collection('bons', function (err, collection) {
    collection.remove({ _id: new require('mongodb').ObjectID(req.params.id) },
        function (err, result) {
            res.send(result);
        });
    });
};
//
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