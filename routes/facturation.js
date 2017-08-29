exports.get = function (req, res) {
    db.collection('factures', function (err, collection) {
        collection.findOne({ _id: new require('mongodb').ObjectID(req.params.id) }, function (err, item) {
            res.send(item);
        })
    });
};
exports.getAll = function (req, res) {
    var skip = (parseInt(req.params.idp) - 1) * parseInt(req.params.nbr);
    var limit = parseInt(req.params.nbr);
    var ret = new Object();
    
    db.collection('factures', function (err, collection) {
        collection.count({}, function (err, count) {
            ret.count = count;
            collection.find().skip(skip).limit(limit).toArray(function (err, items) {
                ret.items = items;
                res.send(ret);
            });
        });
    });
};
exports.delete = function (req, res) {
    db.collection('factures', function (err, collection) {
    collection.remove({ _id: new require('mongodb').ObjectID(req.params.id) },
        function (err, result) {
            res.send(result);
        });
    });
};
exports.add = function (req, res) {
    var pid = req.params.id;
    var facture = req.body.facture;
    facture.dateModif = shared.getReunionLocalDate();
    facture.user = new require('mongodb').ObjectID(req.decoded._id);
    if (facture.type == '0')
    {
        facture.client = new require('mongodb').ObjectID(facture.client._id);
    }
    else {
        facture.producteur = new require('mongodb').ObjectID(facture.producteur._id);
    }
    for(var i = 0;i < facture.bons.length;i++)
    {
        facture.bons[i] = new require('mongodb').ObjectID(facture.bons[i]);
    }
    db.collection('factures', function (err, collection) {
        if (pid == "-1")
        {
            facture.dateCreation = shared.getReunionLocalDate();
            collection.insert( facture , function (err, saved) {
            });
        }
        else {
            delete facture._id;
            collection.update(
                { _id: new require('mongodb').ObjectID(pid) },
                facture);
        }
        //LOCK / UNLOCK BONS
        db.collection('bons', function (err, collection) {
            var upd;
            if (facture.type == '0')
            {
                upd = {$set:{"facturation.client":true}};
            }
            else {
                upd = {$set:{"facturation.producteur":true}};
            }
            collection.update(
                { _id: {$in:facture.bons} },
                upd
                );
                res.send(true);
        });
    });
};