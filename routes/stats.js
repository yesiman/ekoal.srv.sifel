exports.prevsByDay = function (req, res) {
    db.collection('planifs_lines', function (err, collection) {
        collection.aggregate(
            { $group : {
                _id: {
                    year : { $year : "$datePlant" },        
                    month : { $month : "$datePlant" },        
                    day : { $dayOfMonth : "$datePlant" },
                },
                count: { $sum: "$qte" }
            }}, // you can only project fields from 'group'
            function(err, summary) {
                req.send({items:summary });
            }
        );
    });  
};