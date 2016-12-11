exports.prevsByDay = function (req, res) {
    db.collection('planifs_lines', function (err, collection) {
        var obj_ids = [];
        for(var i=0;i<req.body.prodsIds.length;i++)
        {
            obj_ids.push(new require('mongodb').ObjectID(req.body.prodsIds[i]));
        }
        collection.aggregate(
            { "$match":{ produit: { "$in": obj_ids }}},
            { $group : {
                _id: {
                    year : { $year : "$datePlant" },        
                    month : { $month : "$datePlant" },        
                    day : { $dayOfMonth : "$datePlant" },
                    produit: "$produit"
                },
                count: { $sum: "$qte" }
            }},
            { $sort : { produit : 1, year: 1, month: 1, day: 1 }},
            function(err, summary) {
                console.log(err);
                console.log(summary);
                
                res.send({items:summary });
            }
        );
    });  
};