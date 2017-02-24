
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
    var months = getObjectifMonths();
    var objectifs = [];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].split(";");
        db.collection('products', function (err, collection) {
            collection.findOne({ codeProd: {$eq:line[0]},orga:new require('mongodb').ObjectID(req.decoded.orga)}, function (err, item) {
                if (item)
                {
                    var objectif = {
                        produit:new require('mongodb').ObjectID(item._id),
                        user:new require('mongodb').ObjectID(req.decoded._id),
                        lines: months
                    };
                    objectifs.push(produit);   
                }
            });
        });         
    }
    if (errors.length == 0)
    {
        db.collection('products_objectifs', function (err, collection) {
            for (var i = 0; i < objectifs.length; i++) {
                collection.insert(objectifs[i] , function (err, saved) { 
                });
            }
            res.send({success:true});
        });
    }
    else {
        res.send({success:false,errors:errors});
    }
    
}

var getObjectifMonths = function() {
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
    return months;
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