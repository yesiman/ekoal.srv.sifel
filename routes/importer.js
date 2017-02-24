
exports.produits = function (req, res) {
    var lines = req.files[0].buffer.toString().split("\n");
    var prods = [];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].split(";");
        var produit = {
            user:new require('mongodb').ObjectID(req.decoded._id),
            dateModif: new Date(),
            orga:new require('mongodb').ObjectID(req.decoded.orga),
            codeProd:line[0],
            lib:line[1],
            rendement:{
                val:0,
                unit:2
            }
        };
        prods.push(produit);    
    }
    if (errors.length == 0)
    {
        db.collection('products', function (err, collection) {
            for (var i = 0; i < prods.length; i++) {
                collection.insert(prods[i] , function (err, saved) { 
                });
            }
            res.send({success:true,errors:errors});
        });
    }
    else {
        res.send({success:false,errors:errors});
    }
    
    res.send(true);
}
exports.producteurs = function (req, res) {
    var lines = req.files[0].buffer.toString().split("\n");
    var users = [];
    var errors = [];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].split(";");
        var user = {
            type:4,
            dateModif: new Date(),
            orga:new require('mongodb').ObjectID(req.decoded.orga),
            codeAdh:line[2],
            name:line[4],
            surn:line[5],
            pass:line[7],
            mobPhone:line[8],
            certif:line[9]
        };
        users.push(user);    
    }
    if (errors.length == 0)
    {
        db.collection('users', function (err, collection) {
            for (var i = 0; i < users.length; i++) {
                collection.insert(users[i] , function (err, saved) { 
                });
            }
            res.send({success:true});
        });
    }
    else {
        res.send({success:false,errors:errors});
    }
    
}
exports.objectifs = function (req, res) {
    var lines = req.files[0].buffer.toString().split("\n");
    var prods = [];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].split(";");
        var objectif = {
            produit:new require('mongodb').ObjectID(req.decoded._id),
            dateModif: new Date(),
            orga:new require('mongodb').ObjectID(req.decoded.orga),
            codeProd:line[0],
            lib:line[1],
            rendement:{
                val:0,
                unit:2
            }
        };
        prods.push(produit);    
    }
    if (errors.length == 0)
    {
        db.collection('products', function (err, collection) {
            for (var i = 0; i < prods.length; i++) {
                collection.insert(prods[i] , function (err, saved) { 
                });
            }
            res.send({success:true,errors:errors});
        });
    }
    else {
        res.send({success:false,errors:errors});
    }
    
    res.send(true);
}