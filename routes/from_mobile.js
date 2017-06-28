
exports.uploadDatas = function (req, res) {
    var lines = data.body.lines;
    db.collection('parcelles', function (err, collection) {
        for (var i = 0; i < lines.length; i++) {
            console.log(line,lines[i]);
            //SET MONGOGEO CORRECTLY "POLYGON"
            /*collection.update(
                    { _id: lines[i]._id },
                    lines[i], 
                    { "upsert": true },
                    function(err, results) {
                    });*/ 
        }
        res.send({success:true});
    });
}