exports.prevsByDay = function (req, res) {
    getStdArrays(req.decoded,req.body,function(result)
    {   
        var obj_ids = result.produisIds;
        var producteurs = result.producteurs;
        db.collection('planifs_lines', function (err, collection) {
            var query = {};
            query["$match"] = {};
            query["$match"]["produit"] = { "$in": obj_ids };
            if (req.decoded.type == 1){
                //filtre produits publiques
            }
            else {
                query["$match"]["producteur"] = { "$in": producteurs };
            }

            query["$match"]["startAt"] = getDatesFilter(req.body);
            var group = {};
            var sort = {};
            group["$group"] = {};
            
            group["$group"]["_id"] = {};
            switch (req.body.dateFormat)
            {
                case "w":
                    group["$group"]["_id"]["year"] = { $year: "$startAt" };
                    group["$group"]["_id"]["week"] = "$semaine";
                    sort["$sort"] = {  
                        "_id.year": 1, 
                        "_id.week": 1, 
                        "_id.produit" : 1 
                    };
                    break;
                case "m":
                    group["$group"]["_id"]["year"] = { $year: "$startAt" };
                    group["$group"]["_id"]["month"] = "$mois";
                    sort["$sort"] = {  
                        "_id.year": 1, 
                        "_id.month": 1, 
                        "_id.produit" : 1 
                    };
                    break;
                case "d":
                default:
                    group["$group"]["_id"]["year"] = { $year: "$dateRec" };
                    group["$group"]["_id"]["month"] = { $month: "$dateRec" };
                    group["$group"]["_id"]["day"] = { $dayOfMonth: "$dateRec" };
                    sort["$sort"] = {  
                        "_id.year": 1, 
                        "_id.month": 1, 
                        "_id.day": 1,
                        "_id.produit" : 1 
                    };
                    break;
            }
            group["$group"]["_id"]["produit"] = "$produit";
            switch (req.body.unit.toString())
            {
                case "1":
                    //group["$group"]["count"] = { $sum: "$qte.val" };
                    group["$group"]["count"] = { $sum: 
                        { $cond: { if: { $eq: [ "$qte.unit", 1] }, then: "$qte.val", else: { $multiply: [ "$qte.val", 1000 ] } } }
                    };
                    break;
                case "2":
                    group["$group"]["count"] = { $sum: 
                        { $cond: { if: { $eq: [ "$qte.unit", 2] }, then: "$qte.val", else: { $divide: [ "$qte.val", 1000 ] }} }
                    };
                    break;
            }
                            
            collection.aggregate(
                query,
                group,
                sort,
                function(err, summary) {
                    //GET PRODUCTEURS
                    /*var producteurs = [];
                    for (var isum = 0;isum < summary.length;isum++)
                    {
                        var found = false;
                        console.log(summary[isum]);
                        for (var i = 0;i < producteurs.length;i++)
                        {
                            if (producteurs[i].toString() === summary[isum].producteur.toString())
                            {
                                found = true;
                            }
                        }
                        if (!found) { producteurs.push(new require('mongodb').ObjectID(summary[isum].producteur)); }
                    }
                    db.collection('users', function (err, collection) {
                        
                        collection.find({ _id: { $in: producteurs }}).toArray(function (err, items) {
                            res.send({items:summary,producteurs:items });
                        });
                    });*/   
                    res.send({items:summary,producteurs:[] });
                }
            );
        });  
    });
};
exports.prevsByProducteur = function (req, res) {
    getStdArrays(req.decoded,req.body,function(result)
    {   
        var obj_ids = result.produisIds;
        var producteurs = result.producteurs;
        db.collection('planifs_lines', function (err, collection) {
            var query = {};
            query["$match"] = {};
            query["$match"]["produit"] = { "$in": obj_ids };
            if (req.decoded.type == 1){
                //filtre produits publiques
            }
            else {
                query["$match"]["producteur"] = { "$in": producteurs };
            }
            
            query["$match"]["startAt"] = getDatesFilter(req.body);
            var group = {};
            var sort = {};
            group["$group"] = {};
            
            group["$group"]["_id"] = {};
            switch (req.body.dateFormat)
            {
                case "w":
                    group["$group"]["_id"]["year"] = { $year: "$startAt" };
                    group["$group"]["_id"]["week"] = "$semaine";
                    sort["$sort"] = {  
                        "_id.year": 1, 
                        "_id.week": 1, 
                        "_id.producteur" : 1 
                    };
                    break;
                case "m":
                    group["$group"]["_id"]["year"] = { $year: "$startAt" };
                    group["$group"]["_id"]["month"] = "$mois";
                    sort["$sort"] = {  
                        "_id.year": 1, 
                        "_id.month": 1, 
                        "_id.producteur" : 1 
                    };
                    break;
                case "d":
                default:
                    group["$group"]["_id"]["year"] = { $year: "$dateRec" };
                    group["$group"]["_id"]["month"] = { $month: "$dateRec" };
                    group["$group"]["_id"]["day"] = { $dayOfMonth: "$dateRec" };
                    sort["$sort"] = {  
                        "_id.year": 1, 
                        "_id.month": 1, 
                        "_id.day": 1,
                        "_id.producteur" : 1 
                    };
                    break;
            }
            group["$group"]["_id"]["producteur"] = "$producteur";
            switch (req.body.unit.toString())
            {
                case "1":
                    //group["$group"]["count"] = { $sum: "$qte.val" };
                    group["$group"]["count"] = { $sum: 
                        { $cond: { if: { $eq: [ "$qte.unit", 1] }, then: "$qte.val", else: { $multiply: [ "$qte.val", 1000 ] } } }
                    };
                    break;
                case "2":
                    group["$group"]["count"] = { $sum: 
                        { $cond: { if: { $eq: [ "$qte.unit", 2] }, then: "$qte.val", else: { $divide: [ "$qte.val", 1000 ] }} }
                    };
                    break;
            }

            collection.aggregate(
                query,
                group,
                sort,
                function(err, summary) { 
                    var prodsToGet = [];
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
                    });
                }
            );
        });  
    });    
};
exports.prevsPlanifsLines = function (req, res) {
    var skip = (parseInt(req.params.idp) - 1) * parseInt(req.params.nbr);
    var limit = parseInt(req.params.nbr);
    getStdArrays(req.decoded,req.body,function(result)
    {   
        var obj_ids = result.produisIds;
        var producteurs = result.producteurs;
        db.collection('planifs_lines', function (err, collection) {
            var query = {
                produit:{ "$in": obj_ids },
                startAt:getDatesFilter(req.body)
            };
            if (req.decoded.type == 1){
                //filtre produits publiques
            }
            else {
                query["producteur"] = { "$in": producteurs };
            }
            collection.count(query, function (err, count) {
                collection.find(query).sort({startAt:1}).skip(skip).limit(limit).toArray(function (err, items) {
                    res.send({count:count,items:items});        
                });
            });
        });  
    });
};
exports.prevsPlanifsLines = function (req, res) {
    var skip = (parseInt(req.params.idp) - 1) * parseInt(req.params.nbr);
    var limit = parseInt(req.params.nbr);
    getStdArrays(req.decoded,req.body,function(result)
    {   
        var obj_ids = result.produisIds;
        var producteurs = result.producteurs;
        db.collection('planifs_lines', function (err, collection) {
            var query = {
                produit:{ "$in": obj_ids },
                startAt:getDatesFilter(req.body)
            };
            if (req.decoded.type == 1){
                //filtre produits publiques
            }
            else {
                query["producteur"] = { "$in": producteurs };
            }
            collection.count(query, function (err, count) {
                collection.find(query).sort({startAt:1}).skip(skip).limit(limit).toArray(function (err, items) {
                    res.send({count:count,items:items});        
                });
            });
        });  
    });
};
exports.prevsPlanifsLinesApplyPercent = function (req, res) {
    var percent = req.body.percent;    
    console.log("percent",percent);
    getStdArrays(req.decoded,req.body,function(result)
    {   
        var obj_ids = result.produisIds;
        var producteurs = result.producteurs;
        db.collection('planifs_lines', function (err, collection) {
            var query = {
                produit:{ "$in": obj_ids },
                startAt:getDatesFilter(req.body)
            };
            if (req.decoded.type == 1) {
                //filtre produits publiques
            }
            else {
                query["producteur"] = { "$in": producteurs };
            }
            collection.find(query).toArray(function (err, items) {
                //START DECAL PLINES
                for (var i = 0;i < items.length;i++)
                {
                    var opl = items[i];
                    var pid = opl._id;
                    delete opl._id;
                    opl.qte.val = opl.qte.val - ((opl.qte.val*10)/100);
                    collection.update(
                        { _id: new require('mongodb').ObjectID(pid) },
                        opl);
                }
                res.send("ok");        
            });
        });  
    });
};

function getDatesFilter(body) {
    var beg = new Date(body.dateFrom);
    beg.setHours(0);
    beg.setMinutes(0);
    beg.setSeconds(0);
    var end = new Date(body.dateTo);
    end.setHours(23);
    end.setMinutes(59);
    end.setSeconds(59);
    return { $gte: new Date(beg),$lt: new Date(end)};
}
function getStdArrays(decoded,body,callback) {
    switch (decoded.type)
    {
        case  1:   //VOIT TOUT CE QUI EST PUBLIC
            usersFilter = {};
            break;
        case  2:   //FILTRE SUR PLANIFS PRODUCTEURS LIES
            usersFilter = { orga: new require('mongodb').ObjectID(decoded.orga), type: { $eq: 4 } };
            break;
        case 3:  //FILTRE SUR PLANIFS PRODUCTEURS LIES
        case 4:
            usersFilter = { _id: new require('mongodb').ObjectID(decoded._id) };
    }
    db.collection('users', function (err, collection) {
        collection.find(usersFilter).toArray(function (err, items) {
            var obj_ids = [];
            var producteurs = [];
            for(var i=0;i<body.prodsIds.length;i++)
            {
                obj_ids.push(new require('mongodb').ObjectID(body.prodsIds[i]));
            }        
            switch (decoded.type)
            {
                case  1:   //VOIT TOUT CE QUI EST PUBLIC
                    producteurs = [];
                    break;
                case  2:   //FILTRE SUR PLANIFS PRODUCTEURS LIES
                    for(var i1=0;i1<items.length;i1++)
                    {
                        producteurs.push(new require('mongodb').ObjectID(items[i1]._id));
                    }
                    break;
                case  3:  //FILTRE SUR PLANIFS PRODUCTEURS LIES
                    for(var i1=0;i1<items.length;i1++)
                    {
                        for(var i=0;i<items[i1].producteurs.length;i++)
                        {
                            producteurs.push(new require('mongodb').ObjectID(items[i1].producteurs[i]));
                        }
                    }
                    break;
                case 4:  //FILTRE SUR SES DONNEES
                    producteurs = [new require('mongodb').ObjectID(decoded._id)];
            }
            callback({producteurs:producteurs,produisIds:obj_ids});
        });
    });
    
}