exports.prevsByDay = function (req, res) {
    db.collection('users', function (err, collection) {
        collection.findOne({ _id: new require('mongodb').ObjectID(req.decoded._id) }, function (err, item) {
            var user = item;
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
                        producteurs = [];
                        break;
                    case  3:  //FILTRE SUR PLANIFS PRODUCTEURS LIES
                        for(var i=0;i<user.producteurs.length;i++)
                        {
                            producteurs.push(new require('mongodb').ObjectID(user.producteurs[i]));
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
        })
    });
};