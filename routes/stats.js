exports.prevsByDay = function (req, res) {
    var usersFilter = {};
    switch (req.decoded.type)
    {
        case  1:   //VOIT TOUT CE QUI EST PUBLIC
            producteurs = [];
            break;
        case  2:   //FILTRE SUR PLANIFS PRODUCTEURS LIES
            usersFilter = { orga: new require('mongodb').ObjectID(req.decoded.orga), type: { $eq: 4 } };
            break;
        case 3:  //FILTRE SUR PLANIFS PRODUCTEURS LIES
        case 4:
            usersFilter = { _id: new require('mongodb').ObjectID(req.decoded._id) };
    }

    db.collection('users', function (err, collection) {
        collection.find(usersFilter).toArray(function (err, items) {
            db.collection('planifs_lines', function (err, collection) {
                var obj_ids = [];
                var producteurs = [];
                for(var i=0;i<req.body.prodsIds.length;i++)
                {
                    obj_ids.push(new require('mongodb').ObjectID(req.body.prodsIds[i]));
                }        
                switch (req.decoded.type)
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
                        producteurs = [new require('mongodb').ObjectID(req.decoded._id)];
                }

                var query = {};
                query["$match"] = {};
                query["$match"]["produit"] = { "$in": obj_ids };
                if (req.decoded.type == 1){
                    //filtre produits publiques
                }
                else {
                    query["$match"]["producteur"] = { "$in": producteurs };
                }
                query["$match"]["dateRec"] = { $gte: new Date(req.body.dateFrom),$lt: new Date(req.body.dateTo)};
                var group = {};
                var sort = {};
                group["$group"] = {};
                
                group["$group"]["_id"] = {};
                switch (req.body.dateFormat)
                {
                    case "w":
                        group["$group"]["_id"]["year"] = { $year: "$dateRec" };
                        group["$group"]["_id"]["week"] = { $week: "$dateRec" };
                        sort["$sort"] = {  
                            "_id.year": 1, 
                            "_id.week": 1, 
                            "_id.produit" : 1 
                        };
                        break;
                    case "m":
                        group["$group"]["_id"]["year"] = { $year: "$dateRec" };
                        group["$group"]["_id"]["month"] = { $month: "$dateRec" };
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
                group["$group"]["_id"]["producteur"] = "$producteur";
                group["$group"]["count"] = { $sum: "$qte" };
                collection.aggregate(
                    query,
                    group,
                    sort,
                    function(err, summary) {
                        //GET PRODUCTEURS
                        var producteurs = [];
                        db.collection('users', function (err, collection) {
                            for (var isum = 0;isum < summary.length;isum++)
                            {
                                var found = false;
                                for (var i = 0;i < producteurs.length;i++)
                                {
                                    if (new require('mongodb').ObjectID(producteurs[i]) === new require('mongodb').ObjectID(summary[isum]._id.producteur))
                                    {
                                        found = true;
                                    }
                                }
                                if (!found) { producteurs.push(new require('mongodb').ObjectID(summary[isum]._id.producteur)); }
                            }
                            console.log(producteurs);
                            var filters = { producteur: { $in: producteurs } };
                            collection.find(filters).toArray(function (err, items) {
                                res.send({items:summary,producteurs:items });
                            });
                        });   
                    }
                );
            });  
        });
    });
};