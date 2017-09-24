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
        pals.forEach(function(item,index){
            var p = item;
            p.produits.forEach(function(item,index){
                console.log("ITEM!!!",item);
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
        pals.forEach(function(item,index){
            var p = item;
            p.produits.forEach(function(item,index){
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
                            db.collection('clients', function (err, collection) {
                                collection.findOne({ 
                                    _id: new require('mongodb').ObjectID(ret.client),
                                    orga:new require('mongodb').ObjectID(req.decoded.orga) }, 
                                function (err, item) {
                                    console.log("client IS",item);
                                    ret.client = item;
                                    getPalsProductsDatas(ret.palettes).then(function (data) {
                                        ret.palettes = data;
                                        getPalsCategsDatas(ret.palettes).then(function (data) {
                                            ret.palettes = data;
                                            console.log("backdata",ret.palettes);
                                            res.send(ret);
                                        });
                                    });                             ;
                                });
                            });   
                                
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
    var prodMode = (body.producteurs && (body.producteurs.length > 0));
    var clientMode = (body.clients && (body.clients.length > 0));
    var filters = { 
        orga:new require('mongodb').ObjectID(decoded.orga),
    };
    if (prodMode && body.noLock)
    {
        filters = { 
            orga:new require('mongodb').ObjectID(decoded.orga),
            'facturation.producteur':{'$exists':false}
        };
    }
    if (clientMode && body.noLock)
    {
        filters = { 
            orga:new require('mongodb').ObjectID(decoded.orga),
            'facturation.client':{'$exists':false}
        };
    }
    var ids = [];
    if (body.lta && (body.lta.length > 0))
    {   
        filters.noLta = { '$regex': body.lta, $options: 'i' };
    }
    //console.log(body.producteurs);
    if (prodMode)
    {   
        ids = [];
        for(var i=0;i<body.producteurs.length;i++)
        {
            if (!(ids.indexOf(body.producteurs[i]) > -1))
            {
                ids.push(new require('mongodb').ObjectID(body.producteurs[i]));
            }
        }
        filters.producteur = { '$in': ids };
    }

    if (body.stations && (body.stations.length > 0))
    {   
        ids = [];
        for(var i=0;i<body.stations.length;i++)
        {
            if (!(ids.indexOf(body.stations[i]) > -1))
            {
                ids.push(new require('mongodb').ObjectID(body.stations[i]));
            }
        }
        filters.station = { '$in': ids };
    }
    if (clientMode)
    {   
        ids = [];
        for(var i=0;i<body.clients.length;i++)
        {
            if (!(ids.indexOf(body.clients[i]) > -1))
            {
                ids.push(new require('mongodb').ObjectID(body.clients[i]));
            }
        }
        filters.client = { '$in': ids };
    }
    if (body.dateFrom && body.dateTo)
    {
        var beg = new Date(body.dateFrom);
        beg.setHours(0);
        beg.setMinutes(0);
        beg.setSeconds(0);
        var end = new Date(body.dateTo);
        end.setHours(23);
        end.setMinutes(59);
        end.setSeconds(59);
        filters.dateDoc = { $gte: new Date(beg),$lt: new Date(end)};
    }
    
    //
    console.log("ffilters",filters);
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
                            var ap = [];
                            //STOCK TOUS LES CODES PRODUITS
                            for (var relibon = 0;relibon < ret.items.length;relibon++)
                            {
                                var tb = ret.items[relibon];
                                for (var relipal = 0;relipal < tb.palettes.length;relipal++)
                                {
                                    var tp = tb.palettes[relipal];
                                    for (var reliprod = 0;reliprod < tp.produits.length;reliprod++)
                                    {
                                        ap.push(new require('mongodb').ObjectID(tp.produits[reliprod].produit));
                                    }
                                }
                            }
                            db.collection('products', function (err, collection) {
                                collection.find({_id:{$in:ap}}).toArray(function (err, items) {
                                    ret.produits = items;
                                    res.send(ret);
                                });
                            });
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
                    db.collection('users', function (err, collection) {
                        var producteursIds = [];
                        for(var i=0;i<summary.length;i++)
                        {
                            if (!(producteursIds.indexOf(new require('mongodb').ObjectID(summary[i]._id.producteur)) > -1))
                            {
                                producteursIds.push(new require('mongodb').ObjectID(summary[i]._id.producteur));
                            }
                        }
                        collection.find({_id: {$in:producteursIds}}).toArray(function (err, items) {
                            ret.producteurs = items;
                            ret.byProducteurs = summary;
                            group["$group"] = {};
                            group["$group"]["_id"] = {};
                            group["$group"]["_id"]["station"] = "$station";
                            group["$group"]["count"] = { $sum: "$palettes.poid"};
                            sort["$sort"] = {  
                                "_id.station" : 1 
                            };
                            db.collection('bons', function (err, collection) {
                                collection.aggregate(
                                    query,
                                    {"$unwind": "$palettes"},
                                    group,
                                    sort,
                                    function(err, summary) {
                                        db.collection('stations', function (err, collection) {
                                            var ids = [];
                                            for(var i=0;i<summary.length;i++)
                                            {
                                                if (!(ids.indexOf(new require('mongodb').ObjectID(summary[i]._id.station)) > -1))
                                                {
                                                    ids.push(new require('mongodb').ObjectID(summary[i]._id.station));
                                                }
                                            }
                                            collection.find({_id: {$in:ids}}).toArray(function (err, items) {
                                                ret.stations = items;
                                                ret.byStations = summary;
                                                group["$group"] = {};
                                                group["$group"]["_id"] = {};
                                                group["$group"]["_id"]["produit"] = "$palettes.produits.produit";
                                                group["$group"]["count"] = { $sum: "$palettes.produits.poid"};
                                                sort["$sort"] = {  
                                                    "_id.produit" : 1 
                                                };
                                                db.collection('bons', function (err, collection) {
                                                    collection.aggregate(
                                                        query,
                                                        {"$unwind": "$palettes"},
                                                        {"$unwind": "$palettes.produits"},
                                                        group,
                                                        sort,
                                                        function(err, summary) {

                                                            db.collection('products', function (err, collection) {
                                                                var ids = [];
                                                                for(var i=0;i<summary.length;i++)
                                                                {
                                                                    if (!(ids.indexOf(new require('mongodb').ObjectID(summary[i]._id.produit)) > -1))
                                                                    {
                                                                        ids.push(new require('mongodb').ObjectID(summary[i]._id.produit));
                                                                    }
                                                                }
                                                                collection.find({_id: {$in:ids}}).toArray(function (err, items) {
                                                                    ret.produits = items;
                                                                    ret.byProduits = summary;
                                                                    res.send(ret);
                                                                });
                                                            });                                                            
                                                        }
                                                    );
                                                });
                                            });
                                        });
                                    }
                                );
                            });
                        });
                    });
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
    var bon = req.body.bon;
    bon.dateModif = shared.getReunionLocalDate();
    bon.dateDoc = new Date(bon.dateDoc);
    bon.user = new require('mongodb').ObjectID(req.decoded._id);
    bon.orga =  new require('mongodb').ObjectID(req.decoded.orga);
    bon.station = new require('mongodb').ObjectID(bon.station);
    bon.client =  new require('mongodb').ObjectID(bon.client);
    bon.producteur =  new require('mongodb').ObjectID(bon.producteur);
    console.log(bon.palettes);
    for (var relipal = 0;relipal < bon.palettes.length;relipal++)
    {
        bon.palettes[relipal].condit = new require('mongodb').ObjectID(bon.palettes[relipal].condit);
        for (var reliprod = 0;reliprod < bon.palettes[relipal].produits.length;reliprod++)
        {
            bon.palettes[relipal].produits[reliprod].produit = new require('mongodb').ObjectID(bon.palettes[relipal].produits[reliprod].produit);
            bon.palettes[relipal].produits[reliprod].categorie = new require('mongodb').ObjectID(bon.palettes[relipal].produits[reliprod].categorie);   
        }
    }
    db.collection('bons', function (err, collection) {
        if (pid == "-1")
        {
            bon.dateCreation = shared.getReunionLocalDate();
            collection.insert( bon , function (err, saved) {
                if (err || !saved) {
                    res.send(false)
                }
                else {
                    res.send(true);
                }
            });
        }
        else {
            delete bon._id;
            collection.update(
                { _id: new require('mongodb').ObjectID(pid) },
                bon);
                res.send(true);
        }      
    });
};

exports.getLc = function (req, res) {
    var bs = [];
    //BONS FILTERS
    for(var i = 0;i < req.body.bons.length;i++)
    {
        bs.push(new require('mongodb').ObjectID(req.body.bons[i]));
    }
    db.collection('bons', function (err, collection) {
        collection.find({_id:{$in:bs}}).toArray(function (err, items) {
            //AGREG PRODUITS & PRODUCTEURS
            var bons = items;
            var produitsAdded = [];
            var producteursAdded = [];
            var produitsIds = [];
            var producteursIds = [];
            for(var ib = 0;ib < items.length;ib++)
            {
                var bon = items[ib];
                if (!(producteursAdded[bon.producteur] == bon.producteur)) {
                    producteursAdded[bon.producteur] = bon.producteur;
                    producteursIds.push(new require('mongodb').ObjectID(bon.producteur));
                }
                for(var ip = 0;ip < bon.palettes.length;ip++)
                {
                    var pal = bon.palettes[ip];
                    for(var iprod = 0;iprod < pal.produits.length;iprod++)
                    {
                        var prod = pal.produits[iprod];
                        var found = false;
                        for(var ipa = 0;ipa < produitsAdded.length;ipa++)
                        {
                            if (produitsAdded[ipa] == (prod.produit + "/" + prod.calibre)){
                                found = true;
                            }
                        }
                        if (!found)
                        {
                            produitsAdded.push(prod.produit + "/" + prod.calibre);
                            produitsIds.push(new require('mongodb').ObjectID(prod.produit));
                        }
                    }
                }
            }
            //GET Px IDs DATAS
            db.collection('users', function (err, collection) {
                collection.find({_id:{$in:producteursIds}}).toArray(function (err, items) {
                    var producteursList = items;
                    db.collection('products', function (err, collection) {
                        collection.find({_id:{$in:produitsIds}}).toArray(function (err, items) {
                            var produitsList = items;
                            //HEADERS
                            var ret = "Bon;Producteur;Palette;"
                            for(var ipa = 0;ipa < produitsAdded.length;ipa++)
                            {
                                for(var ipl = 0;ipl < produitsList.length;ipl++)
                                {
                                    if(produitsAdded[ipa].startsWith(produitsList[ipl]._id + "/"))
                                    {
                                        ret += produitsList[ipl].lib + " - " + produitsAdded[ipa].replace(produitsList[ipl]._id + "/","") + ";";
                                    }
                                }
                            }
                            ret += "P. Brut;P. Net;\n";
                            //BODY
                            
                            for(var ib = 0;ib < bons.length;ib++)
                            {
                                var bon = bons[ib];
                                
                                for(var ip = 0;ip < bon.palettes.length;ip++)
                                {
                                    var amid = [];
                                    var pal = bon.no + ";" + bon.palettes[ip];
                                    //GET PRODUCTEUR
                                    for(var ipl = 0;ipl < producteursList.length;ipl++)
                                    {
                                        //console.log(producteursList[ipl]._id.toString-), bon.producteur);
                                        if(producteursList[ipl]._id.toString() == bon.producteur.toString())
                                        {
                                            ret += producteursList[ipl].codeAdh + ";";
                                        }
                                    }
                                    ret += pal.no + ";";
                                    //GET PRODUIT

                                    for (var inte = 0;inte < produitsAdded.length;inte++)
                                    {
                                        amid.push(0)
                                    }

                                    for(var iprod = 0;iprod < pal.produits.length;iprod++)
                                    {
                                        var prod = pal.produits[iprod];
                                        for(var ipa = 0;ipa < produitsAdded.length;ipa++)
                                        {
                                            
                                            if((produitsAdded[ipa] == prod.produit + "/" + prod.calibre))
                                            {
                                                amid[ipa] += prod.colisNb;
                                                //ret += prod.colisNb + ";";
                                            }
                                        }
                                        //ret += ";";   
                                    }

                                    for(var iamid = 0;iamid < amid.length;iamid++)
                                    {
                                        ret += amid[iamid] + ";";
                                    }

                                    ret += (pal.poid + pal.tare) + ";";
                                    ret += pal.poid + ";\n";
                                }
                            }
                            res.set('Content-Type', 'application/octet-stream');
                            res.send({content:ret});
                        });
                    });
                });
            });

            


            
        });
    });
}