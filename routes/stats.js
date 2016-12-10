exports.prevsByDay = function (req, res) {
    console.log(req.body.prodsIds);
    console.log(req.body.dateFrom);
    console.log(req.body.dateTo);
    db.collection('planifs_lines', function (err, collection) {
        collection.aggregate(
            { $group : {
                _id: {
                    year : { $year : "$datePlant" },        
                    month : { $month : "$datePlant" },        
                    day : { $dayOfMonth : "$datePlant" },
                },
                count: { $sum: "$qte" }
            }},
            { $match:{'produit': {$in: req.body.prodsIds}}},
            function(err, summary) {
                res.send({items:summary });
            }
        );
    });  
};