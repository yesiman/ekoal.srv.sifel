exports.prevsByDay = function (req, res) {
    console.log(req.body.prodsIds);
    console.log(req.body.dateFrom);
    console.log(req.body.dateTo);
    db.collection('planifs_lines', function (err, collection) {
        var obj_ids = req.body.prodsIds.map(function (item){ return new require('mongodb').ObjectId(item)});
        console.log(obj_ids);
        collection.aggregate(
            { $group : {
                _id: {
                    year : { $year : "$datePlant" },        
                    month : { $month : "$datePlant" },        
                    day : { $dayOfMonth : "$datePlant" },
                },
                count: { $sum: "$qte" }
            }},
            { $match:{ '$produit': { $in: [new require('mongodb').ObjectId('5833fde242b6351200ec4e72')] }}},
            function(err, summary) {
                res.send({items:summary });
            }
        );
    });  
};