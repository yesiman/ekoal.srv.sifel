
exports.produits = function (req, res) {
    var lines = req.files[0].buffer.toString().split("\n");
    var prods = [];
    var errors = [];
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
                    collection.insert(result , function (err, saved) { 
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
        console.log(line[0]);
        collection.findOne({ codeProd:{$eq:line[0]},orga:new require('mongodb').ObjectID(orga)}, function (err, item) {
            if (item)
            {   
                getObjectifMonthsv2(line,item._id,user,function(result){
                    console.log(result);
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
                    surface:parseFloat(line[3].toString())
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
Date.prototype.getWeek = function() { 

  // Create a copy of this date object  
  var target  = new Date(this.valueOf());  

  // ISO week date weeks start on monday, so correct the day number  
  var dayNr   = (this.getDay() + 6) % 7;  

  // Set the target to the thursday of this week so the  
  // target date is in the right year  
  target.setDate(target.getDate() - dayNr + 3);  

  // ISO 8601 states that week 1 is the week with january 4th in it  
  var jan4    = new Date(target.getFullYear(), 0, 4);  

  // Number of days between target date and january 4th  
  var dayDiff = (target - jan4) / 86400000;    

  if(new Date(target.getFullYear(), 0, 1).getDay() < 5) {
    // Calculate week number: Week 1 (january 4th) plus the    
    // number of weeks between target date and january 4th    
    return Math.ceil(dayDiff / 7);    
  }
  else {  // jan 4th is on the next week (so next week is week 1)
    return Math.ceil(dayDiff / 7); 
  }
};