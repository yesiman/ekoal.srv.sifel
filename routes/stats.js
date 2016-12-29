exports.prevsByDay = function (req, res) {
    db.collection('planifs_lines', function (err, collection) {
        var obj_ids = [];
        var dynaMatch = {};
        for(var i=0;i<req.body.prodsIds.length;i++)
        {
            obj_ids.push(new require('mongodb').ObjectID(req.body.prodsIds[i]));
        }

        dynaMatch.produit = { "$in": obj_ids };
        dynaMatch.dateRec = {
                    $gte: new Date(req.body.dateFrom),
                    $lt: new Date(req.body.dateTo)};

        switch (req.decoded.type)
        {
            case  1:   //VOIT TOUT CE QUI EST PUBLIC
                //dynaMatch = { };
                break;
            case  2:   //FILTRE SUR PLANIFS PRODUCTEURS LIES
                //dynaMatch = { };
                break;
            case  3:  //FILTRE SUR PLANIFS PRODUCTEURS LIES
                //dynaMatch = {  };
                break;
            case 4:  //FILTRE SUR SES DONNEES
                //dynaMatch = { };
        }
        collection.aggregate(
            { "$match":{ 
                dynaMatch
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
};