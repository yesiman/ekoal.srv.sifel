var twilio = require('twilio');
var Client = require('node-rest-client').Client;

exports.sendSmsToProducteurs = function(req, res) {
    //READ 
    var beg = new Date();
    beg.setHours(0);
    beg.setMinutes(0);
    beg.setSeconds(0);
    var end = new Date();
    end.setHours(23);
    end.setMinutes(59);
    end.setSeconds(59);
    //dateAlert: { $gte: new Date(beg),$lt: new Date(end)}, 
    db.collection('planifs_lines_alerts', function (err, collection) {
        collection.find(
            { sent:false }
        ).toArray(function (err, items) {
            for (var i = 0;i < items.length;i++)
            {
                var pla = items[i];
                //GET PLANIF_LINE
                getPlanifLine(pla.planif).then(function (data) {
                    var pl = data;
                    //GET PRODUCTEUR
                    db.collection('users', function (err, collection) {
                        collection.findOne({ _id: new require('mongodb').ObjectID(pl.producteur)}, function (err, item) {
                            console.log("producteur",item);
                            //GET PRODUIT
                            db.collection('products', function (err, collection) {
                                collection.findOne({ _id: new require('mongodb').ObjectID(pl.produit)}, function (err, item) {
                                    console.log("produit",item);
                                    //SEND
                                    //UPDATE WITH TWILIO ID
                                })
                            });
                        })
                    });
                })
                .catch(console.error);
            }
        });
    });
    //res.send("ok");
}

function getPlanifLine (id) {
  return new Promise(function (resolve, reject) {
      db.collection('planifs_lines', function (err, collection) {
        collection.findOne({ planif: new require('mongodb').ObjectID(id)}, function (err, item) {
            if (err) return reject(err) // rejects the promise with `err` as the reason
            resolve(item) 
        });
    });
  })
}

exports.testTwilio = function (req, res) {
    var accountSid = 'AC32c5e4d582dd5c0b87b245f01d436ab1'; // Your Account SID from www.twilio.com/console
    var authToken = 'bfa27f2dc359c626f20f275ec2a63636';   // Your Auth Token from www.twilio.com/console
    var client = new twilio.RestClient(accountSid, authToken);
    client.messages.create({
        body: req.body.message.text,
        to: '+262693336223',  // Text this number
        from: '+33644641541' // From a valid Twilio number
    }, function(err, message) {
        res.send(true);
    });

}

exports.smsReceive = function(req, res)
{
    io.sockets.emit('numessag', req.body);
    res.type('text/xml');
    res.send("<Response></Response>");
}