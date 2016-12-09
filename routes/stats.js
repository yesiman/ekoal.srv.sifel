exports.prevsByDay = function (req, res) {
    db.collection('products', function (err, collection) {
        collection.aggregate(
            { $group : {
                _id: {
                    year : { $year : "$datePlant" },        
                    month : { $month : "$datePlant" },        
                    day : { $dayOfMonth : "$datePlant" },
                },
                count: { $sum: 1 }
            }}
        ).toArray(function (err, items) {
                var ret;
                ret.items = items;
                res.send(ret);
            });
    });  
};