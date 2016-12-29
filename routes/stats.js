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
                collection.aggregate(
                    { "$match":{ 
                        produit: { 
                            "$in": obj_ids  
                        },
                        producteur: { 
                            "$in": producteurs 
                        },
                        dateRec: {
                            $gte: new Date(req.body.dateFrom),
                            $lt: new Date(req.body.dateTo)
                        }
                    }},
                    { $group : {
                        _id: {
                            year: { $year: "$dateRec" },
                            month: { $month: "$dateRec" },
                            day: { $dayOfMonth: "$dateRec" },
                            produit: "$produit"
                        },
                        count: { $sum: "$qte" }
                    }},
                    { $sort : { 
                        "_id.produit" : 1, 
                        "_id.year": 1, 
                        "_id.month": 1, 
                        "_id.day": 1 }
                    },
                    function(err, summary) {
                        res.send({items:summary });
                    }
                );
            });  
        });
    });
};