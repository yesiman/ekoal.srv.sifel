exports.add = function (req, res) {
    var pid = req.params.id;
    req.body.planif.dateModif = new Date();
    var lines = req.body.planif.lines;
    delete req.body.planif.lines;
    db.collection('planifs', function (err, collection) {
        if (pid == "-1")
        {
            collection.insert( req.body.planif , function (err, saved) {
                if (err || !saved) {
                    pid = saved.insertedIds[0];
                    //res.send(false)
                }
                else {
                    //res.send(true);
                }
            });
        }
        else {
            delete req.body.planif._id;
            collection.update(
                { _id: new require('mongodb').ObjectID(pid) },
                req.body.planif);
                //res.send(true);
        }
    });
    db.collection('planifs_lines', function (err, collection) {
        for (var i = 0; i < lines.length; i++)
        {
            lines[i].planif = new require('mongodb').ObjectID(pid);
            collection.insert(lines[i], function (err, saved) {});
        }
    });
    res.send(true)
};