
exports.produits = function (req, res) {
    var lines = req.files[0].buffer.toString().split("\n");
    var prods = [];
    var errors = [];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].split(";");
        var produit = {
            user:new require('mongodb').ObjectID(req.decoded._id),
            actif:true,
            dateCreation: shared.getReunionLocalDate(),
            dateModif: shared.getReunionLocalDate(),
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
                collection.update(
                    { orga: prods[i].orga, codeProd:prods[i].codeProd},
                    prods[i], 
                    { "upsert": true },
                    function(err, results) {
                });
            }
            res.send({success:true});
        });
    }
    else {
        res.send({success:false,errors:errors});
    }
}
exports.rulesi = function (req, res) {
    var lines = req.files[0].buffer.toString().split("\n");
    var rules = [];
    var errors = [];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].split(";");
        var rule = {
            code:line[0],
            lib:line[3],
            delAvR:line[4],
            sR:line[5],
        };
        if (rule.code != "" && 
                rule.lib != "" && 
                rule.delAvR != "" && 
                rule.sR != "")
        {
            rule.delAvR = Math.ceil(rule.delAvR);
            rule.sR = Math.ceil(rule.sR);
            rules.push(rule); 
        }
    }
    if (errors.length == 0)
    {
        db.collection('products', function (err, collection) {
            for (var i = 0; i < rules.length; i++) {
                var r = rules[i];
                collection.findOne({ codeProd:{$eq:rules[i].code},orga:new require('mongodb').ObjectID(req.decoded.orga)}, function (err, item) {
                    if (item)
                    {   
                        var ins = {
                            produit:new require('mongodb').ObjectID(item._id),
                            delai:r.delAvR,
                            nbWeek:r.sR,
                            dateModif:shared.getReunionLocalDate(),
                            user: new require('mongodb').ObjectId(req.decoded._id)
                        }

                        var weeks = [];
                        var sumer = 0;
                        var percent = parseFloat((100 / ins.nbWeek).toFixed(2));
                        for(var i2 = 1;i2 <= ins.nbWeek;i2++)
                        {
                            if (i2== ins.nbWeek)
                            {
                                percent = parseFloat((100 - parseFloat(sumer.toFixed(2))).toFixed(2));
                            }
                            sumer += percent;
                            weeks.push({week:i2,percent:percent});
                        }
                        
                        ins.weeks = weeks;

                        console.log(ins);
                    }
                    else {
                    }
                });
            }
            res.send({success:true});
        });
    }
    else {
        res.send({success:false,errors:errors});
    }
}
exports.producteurs = function (req, res) {
    var lines = req.files[0].buffer.toString().split("\n");
    var users = [];
    var errors = [];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].split(";");
        if (line.length == 9)
        {
            var user = {
                type:4,
                actif:true,
                dateCreation: shared.getReunionLocalDate(),
                dateModif: shared.getReunionLocalDate(),
                orga:new require('mongodb').ObjectID(req.decoded.orga),
                codeAdh:line[0],
                name:line[2],
                surn:line[3],
                email:line[4],
                pass:line[5],
                mobPhone:line[6],
                certif:line[7].replace(/(\r\n|\n|\r)/gm,""),
                adresse:line[8].replace(/(\r\n|\n|\r)/gm,"")
            };
            users.push(user);
        }
    }
    if (errors.length == 0)
    {
        db.collection('users', function (err, collection) {
            for (var i = 0; i < users.length; i++) {
                collection.update(
                    { orga: users[i].orga, codeAdh:users[i].codeAdh},
                    users[i], 
                    { "upsert": true },
                    function(err, results) {
                });
            }
            res.send({success:true});
        });
    }
    else {
        res.send({success:false,errors:errors});
    }
    
}
exports.clients = function (req, res) {
    var lines = req.files[0].buffer.toString().split("\n");
    var clients = [];
    var errors = [];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].split(";");
        if (line.length == 8)
        {
            var client = {
                actif:true,
                dateCreation: shared.getReunionLocalDate(),
                dateModif: shared.getReunionLocalDate(),
                orga:new require('mongodb').ObjectID(req.decoded.orga),
                code:line[0],
                name:line[1],
                surn:line[2],
                adresse:line[3],
                adresse_cp:line[4],
                adresse_ville:line[5],
                email:line[6],
                mobPhone:line[7]
            };
            clients.push(client);
        }
    }
    if (errors.length == 0)
    {
        db.collection('clients', function (err, collection) {
            for (var i = 0; i < clients.length; i++) {
                collection.update(
                    { orga: clients[i].orga, code:clients[i].code},
                    clients[i], 
                    { "upsert": true },
                    function(err, results) {
                        
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
    var errors = [];
    var objectifsLines = [];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].split(";");
        getProdId(line,req.decoded._id,req.decoded.orga,function(result)
        {
            db.collection('products_objectifs', function (err, collection) {
                collection.update(
                    { produit: new require('mongodb').ObjectID(result.produit) },
                    result, 
                    { "upsert": true },
                    function(err, results) {
                });
            });
        });
    }
    res.send({success:true});   
}
exports.parcelles = function (req, res) {
    var lines = req.files[0].buffer.toString().split("\n");
    var errors = [];
    var objectifsLines = [];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].split(";");
        getUserId(line,req.decoded.orga,function(result)
        {
            if (result != "")
            {
                db.collection('parcelles', function (err, collection) {
                    collection.update(
                        { code: result.code,
                        producteur: result.producteur
                        },
                        result, 
                        { "upsert": true },
                        function(err, results) {
                    });
                });
            }
        });
    }
    res.send({success:true});   
}
function getProdId(line, user, orga, callback) {
    if (line[0].toString().trim() == "") {callback("");}
    db.collection('products', function (err, collection) {
        collection.findOne({ codeProd:{$eq:line[0]},orga:new require('mongodb').ObjectID(orga)}, function (err, item) {
            if (item)
            {   
                getObjectifMonthsv2(line,item._id,user,function(result){
                    callback(result);
                });
                
            }
            else {
                callback("");
            }
        });
    });
}
function getUserId(line, orga, callback) {
    console.log(line);
    if (line[0].toString().trim() == "") {callback("");}
    db.collection('users', function (err, collection) {
        collection.findOne({ codeAdh:{$eq:line[0].toString().trim()},orga:new require('mongodb').ObjectID(orga)}, function (err, item) {
            if (item)
            {   
                var parcelle = {
                    producteur:new require('mongodb').ObjectID(item._id),
                    lib:line[2].toString(),
                    cadastre:line[4].toString(),
                    code:line[1].toString(),
                    surface:parseFloat(line[3].toString().trim().replace(",","."))
                };
               
                callback(parcelle);
            }
            else {
                callback("");
            }
        });
    });
}
function getObjectifMonthsv2(line,prd,usr,callback){
    getObjectifMonths(function(results) {
        months = results;
        for (var imonth = 0; imonth < months.length; imonth++) {
            var amount = (line[imonth+1].toString().trim()!=""?parseInt(line[imonth+1].replace(" ","")):0);
            months[imonth].rendement = {
                val:amount,
                unit:1
            };
            var amountPerW = amount / months[imonth].weeks.length;
            months[imonth].rendements = {};
            for (var iw = 0;iw < months[imonth].weeks.length;iw++)
            {
                months[imonth].rendements[months[imonth].weeks[iw]] = {val:amountPerW,unit:1};
                
            }
            
        }
        var objectif = {
            produit:new require('mongodb').ObjectID(prd),
            user:new require('mongodb').ObjectID(usr),
            lines: months
        };
        callback(objectif);
    });
}
function getObjectifMonths(callback) {
    var months = [
        {id:1,lib:"Janvier",weeks:[]},
        {id:2,lib:"Février",weeks:[]},
        {id:3,lib:"Mars",weeks:[]},
        {id:4,lib:"Avril",weeks:[]},
        {id:5,lib:"Mai",weeks:[]},
        {id:6,lib:"Juin",weeks:[]},
        {id:7,lib:"Juillet",weeks:[]},
        {id:8,lib:"Aout",weeks:[]},
        {id:9,lib:"Septembre",weeks:[]},
        {id:10,lib:"Octobre",weeks:[]},
        {id:11,lib:"Novembre",weeks:[]},
        {id:12,lib:"Decembre",weeks:[]}
    ];
    var weeksUsed = [];
    for (var d = new Date(new Date().getFullYear(),0,1);d <= new Date(new Date().getFullYear(),11,31);d.setDate(d.getDate() + 3))
    {
        var w = d.getWeek();
        var found = false;
        for (var iw = 0;iw < weeksUsed.length;iw++)
        {
            if ((d.getMonth() + "-"  + w) == weeksUsed[iw])
            {
                found = true;
            }
        }
        if (!found)
        {
            weeksUsed.push(d.getMonth() + "-" + w);
            months[d.getMonth()].weeks.push(w);

        }
    }
    callback(months);
}
