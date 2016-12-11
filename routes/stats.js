exports.prevsByDay = function (req, res) {
    db.collection('planifs_lines', function (err, collection) {
        var obj_ids = [];
        for(var i=0;i<req.body.prodsIds.length;i++)
        {
            obj_ids.push(new require('mongodb').ObjectID(req.body.prodsIds[i]));
        }

        console.log("req.body.dateFrom", req.body.dateFrom);

        console.log("req.body.dateTo", req.body.dateTo);

        collection.aggregate(
            { "$match":{ 
                produit: { 
                    "$in": obj_ids 
                },
                datePlant: {
                    $gte: new require('mongodb').ISODate("req.body.dateFrom"),
                    $lt: new require('mongodb').ISODate("req.body.dateTo")
                }
            }},
            { $group : {
                _id: {
                    year : { $year : "$datePlant" },        
                    month : { $month : "$datePlant" },        
                    day : { $dayOfMonth : "$datePlant" },
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