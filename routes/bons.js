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
function getUser(uid) {
    return new Promise(function(resolve,reject) {
        db.collection('users', function (err, collection) {
            collection.findOne({ _id: new require('mongodb').ObjectID(uid) }, 
                function (err, item) {
                    resolve(item);
                });
        });
    });
}
function getStation(sid) {
    return new Promise(function(resolve,reject) {
        db.collection('stations', function (err, collection) {
            collection.findOne({ _id: new require('mongodb').ObjectID(sid) }, 
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
        var promises = [];
        console.log("getPalsProductsDatas.start");
        pals.forEach(function(item,index){
            var p = item;
            console.log("pal",p.no);
            p.produits.forEach(function(item,index){
                console.log("prod",p.no + "/" + item.produit);
                var promise = getProd(item.produit).then(function(data){
                    item.produit = data;
                    return Q(p);
                });
                if (index >= (p.produits.length- 1))
                {
                    promises.push(promise);
                }
            });
        });
        Q.all(promises).then(function(data){
            resolve(data);
        });
    });
}
//
//
function getBonsProducteursDatas(bons) {
    return new Promise(function (resolve, reject) {
        var promises = [];
        bons.forEach(function(item,index){
            var p = item;
            var promise = getUser(item.producteur).then(function(data){
                item.producteur = data;
                return Q(item);
                
            })
            promises.push(promise);
        });
        Q.all(promises).then(function(data){
            resolve(data);
        });
    });
}
function getBonsStationsDatas(bons) {
    return new Promise(function (resolve, reject) {
        var promises = [];
        bons.forEach(function(item,index){
            var p = item;
            var promise = getStation(item.station).then(function(data){
                item.station = data;
                return Q(item);
            });
            promises.push(promise);
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
        console.log("getPalsCategsDatas.start");
        pals.forEach(function(item,index){
            var p = item;
            console.log("pal",p.no);
            p.produits.forEach(function(item,index){
                console.log("prod",p.no + "/" + item.produit);
                var promise = getCat(item.categorie).then(function(data){
                    item.categorie = data;
                    return Q(p);
                });
                if (index >= (p.produits.length- 1))
                {
                    promises.push(promise);
                }
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
                            console.log("palettes",ret.palettes);
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
function getFinalFilters(body,decoded,callback) {
    var filters = {orga:new require('mongodb').ObjectID(decoded.orga)};
    if (body.lta && (body.lta.length > 0))
    {   
        filters.noLta = { '$regex': body.lta, $options: 'i' };
    }
    var beg = new Date(body.dateFrom);
    beg.setHours(0);
    beg.setMinutes(0);
    beg.setSeconds(0);
    var end = new Date(body.dateTo);
    end.setHours(23);
    end.setMinutes(59);
    end.setSeconds(59);
    filters.dateDoc = { $gte: new Date(beg),$lt: new Date(end)};
    //
    var producteursIds = [];
    for(var i=0;i<body.producteurs.length;i++)
    {
        if (!(producteursIds.indexOf(body.producteurs[i]) > -1))
        {
            producteursIds.push(new require('mongodb').ObjectID(body.producteurs[i]));
        }
    }
    if (producteursIds.length > 0)
    {
        filters.producteur = { $in: producteursIds};
    }
    callback(filters);
}
//
exports.getAll = function (req, res) {
    var skip = (parseInt(req.params.idp) - 1) * parseInt(req.params.nbr);
    var limit = parseInt(req.params.nbr);
    var ret = new Object();
    //
    getFinalFilters(req.body,req.decoded,function(result)
    {
        db.collection('bons', function (err, collection) {
            collection.count(result, function (err, count) {
                ret.count = count;
                collection.find(result).skip(skip).limit(limit).toArray(function (err, items) {
                    getBonsProducteursDatas(items).then(function (data) {
                        ret.items = data;
                        getBonsStationsDatas(items).then(function (data) {
                            ret.items = data;
                            res.send(ret);
                        });  
                    });  
                });
            });
        });
    });
    //
};
//
exports.getStatGlobal = function (req, res) {
    var ret = new Object();
    //
    getFinalFilters(req.body,req.decoded,function(result)
    {
        var query = {};
        var group = {};
        var sort = {};
        db.collection('bons', function (err, collection) {
            query["$match"] = {};
            query["$match"]["dateDoc"] = result.dateDoc;
            group["$group"] = {};
            group["$group"]["_id"] = {};
            group["$group"]["_id"]["producteur"] = "$producteur";
            group["$group"]["count"] = { $sum: "$palettes.poid"};
            sort["$sort"] = {  
                "_id.producteur" : 1 
            };
            collection.aggregate(
                query,
                {"$unwind": "$palettes"},
                group,
                sort,
                function(err, summary) {
                    ret.byProducteurs = summary;
                    group["$group"] = {};
                    group["$group"]["_id"] = {};
                    group["$group"]["_id"]["station"] = "$station";
                    group["$group"]["count"] = { $sum: "$palettes.poid"};
                    sort["$sort"] = {  
                        "_id.station" : 1 
                    };
                    collection.aggregate(
                        query,
                        {"$unwind": "$palettes"},
                        group,
                        sort,
                        function(err, summary) {
                            ret.byStations = summary;
                            group["$group"] = {};
                            group["$group"]["_id"] = {};
                            group["$group"]["_id"]["produit"] = "$palettes.produits.produit";
                            group["$group"]["count"] = { $sum: "$palettes.produits.poid"};
                            sort["$sort"] = {  
                                "_id.produit" : 1 
                            };
                            collection.aggregate(
                                query,
                                {"$unwind": "$palettes"},
                                {"$unwind": "$palettes.produits"},
                                group,
                                sort,
                                function(err, summary) {
                                    ret.byProduits = summary;
                                    res.send(ret);
                                }
                            );
                        }
                    );
                }
            );
        });
    });
    //
};
//
exports.getStatProduits = function (req, res) {
    var ret = new Object();
    //
    getFinalFilters(req.body,req.decoded,function(result)
    {
        var query = {};
        var group = {};
        var sort = {};
        db.collection('bons', function (err, collection) {
            query["$match"] = {};
            query["$match"]["dateDoc"] = result.dateDoc;
            group["$group"] = {};
            group["$group"]["_id"] = {};
            group["$group"]["_id"]["year"] = { $year: "$dateDoc" };
            group["$group"]["_id"]["month"] = { $month: "$dateDoc" };
            group["$group"]["_id"]["day"] = { $dayOfMonth: "$dateDoc" };
            group["$group"]["_id"]["produit"] = "$palettes.produits.produit";
            sort["$sort"] = {  
                "_id.year": 1, 
                "_id.month": 1, 
                "_id.day": 1,
                "_id.produit" : 1 
            };
            group["$group"]["count"] = { $sum: "$palettes.produits.poid"};            
            collection.aggregate(
                query,
                {"$unwind": "$palettes"},
                {"$unwind": "$palettes.produits"},
                group,
                sort,
                function(err, summary) {
                    ret.result = summary;
                    var produitsIds = [];
                    for(var i=0;i<summary.length;i++)
                    {
                        if (!(produitsIds.indexOf(new require('mongodb').ObjectID(summary[i]._id.produit)) > -1))
                        {
                            produitsIds.push(new require('mongodb').ObjectID(summary[i]._id.produit));
                        }
                    }
                    db.collection('products', function (err, collection) {
                        collection.find({_id: {$in:produitsIds}}).toArray(function (err, items) {
                            ret.produits = items;
                            res.send(ret);
                        });
                    });
                }
            );
        });
    });
    //
};
exports.getStatProducteurs = function (req, res) {
    var ret = new Object();
    //
    getFinalFilters(req.body,req.decoded,function(result)
    {
        var query = {};
        var group = {};
        var sort = {};
        db.collection('bons', function (err, collection) {
            query["$match"] = {};
            query["$match"]["dateDoc"] = result.dateDoc;
            group["$group"] = {};
            group["$group"]["_id"] = {};
            group["$group"]["_id"]["year"] = { $year: "$dateDoc" };
            group["$group"]["_id"]["month"] = { $month: "$dateDoc" };
            group["$group"]["_id"]["day"] = { $dayOfMonth: "$dateDoc" };
            group["$group"]["_id"]["producteur"] = "$producteur";
            sort["$sort"] = {  
                "_id.year": 1, 
                "_id.month": 1, 
                "_id.day": 1,
                "_id.producteur" : 1 
            };
            group["$group"]["count"] = { $sum: "$palettes.poid"};            
            collection.aggregate(
                query,
                {"$unwind": "$palettes"},
                group,
                sort,
                function(err, summary) {
                    ret.result = summary;
                    var producteursIds = [];
                    for(var i=0;i<summary.length;i++)
                    {
                        if (!(producteursIds.indexOf(new require('mongodb').ObjectID(summary[i]._id.producteur)) > -1))
                        {
                            producteursIds.push(new require('mongodb').ObjectID(summary[i]._id.producteur));
                        }
                    }
                    db.collection('users', function (err, collection) {
                        collection.find({_id: {$in:producteursIds}}).toArray(function (err, items) {
                            ret.producteurs = items;
                            res.send(ret);
                        });
                    });
                }
            );
        });
    });
    //
};
exports.getStatStations = function (req, res) {
    var ret = new Object();
    //
    getFinalFilters(req.body,req.decoded,function(result)
    {
        var query = {};
        var group = {};
        var sort = {};
        db.collection('bons', function (err, collection) {
            query["$match"] = {};
            query["$match"]["dateDoc"] = result.dateDoc;
            group["$group"] = {};
            group["$group"]["_id"] = {};
            group["$group"]["_id"]["year"] = { $year: "$dateDoc" };
            group["$group"]["_id"]["month"] = { $month: "$dateDoc" };
            group["$group"]["_id"]["day"] = { $dayOfMonth: "$dateDoc" };
            group["$group"]["_id"]["station"] = "$station";
            sort["$sort"] = {  
                "_id.year": 1, 
                "_id.month": 1, 
                "_id.day": 1,
                "_id.station" : 1 
            };
            group["$group"]["count"] = { $sum: "$palettes.poid"};            
            collection.aggregate(
                query,
                {"$unwind": "$palettes"},
                group,
                sort,
                function(err, summary) {
                    ret.result = summary;
                    var stationsIds = [];
                    for(var i=0;i<summary.length;i++)
                    {
                        if (!(stationsIds.indexOf(new require('mongodb').ObjectID(summary[i]._id.station)) > -1))
                        {
                            stationsIds.push(new require('mongodb').ObjectID(summary[i]._id.station));
                        }
                    }
                    db.collection('stations', function (err, collection) {
                        collection.find({_id: {$in:stationsIds}}).toArray(function (err, items) {
                            ret.stations = items;
                            res.send(ret);
                        });
                    });
                }
            );
        });
    });
    //
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