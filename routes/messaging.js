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
                var smsDatas = {};
                var pla = items[i];
                //GET PLANIF_LINE
                getPlanifLine(pla.planif).then(function (data) {
                    smsDatas.pl = data;
                    //GET PRODUCTEUR
                    getUser(smsDatas.pl.producteur).then(function (data) {
                        smsDatas.u = data;
                        //GET PRODUIT
                         getProduit(smsDatas.pl.produit).then(function (data) {
                             smsDatas.p = data;

                             console.log("smsDatas",smsDatas);
                            //SEND
                            sendSms(smsDatas).then(function (data) {
                                console.log(data);
                                //UPDATE WITH TWILIO ID
                                var pid = pla._id;
                                delete pla._id;
                                pla.sent = true;
                                pla.dateSent = new Date();
                                pla.sid = data.sid;
                                collection.update(
                                    { _id: new require('mongodb').ObjectID(pid) },
                                    pla);
                            });
                        });
                    })
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
function getUser (id) {
  return new Promise(function (resolve, reject) {
      db.collection('users', function (err, collection) {
        collection.findOne({ _id: new require('mongodb').ObjectID(id)}, function (err, item) {
            if (err) return reject(err) // rejects the promise with `err` as the reason
            resolve(item) 
        });
    });
  })
}
function getProduit (id) {
  return new Promise(function (resolve, reject) {
      db.collection('products', function (err, collection) {
        collection.findOne({ _id: new require('mongodb').ObjectID(id)}, function (err, item) {
            if (err) return reject(err) // rejects the promise with `err` as the reason
            resolve(item) 
        });
    });
  })
}

function sendSms(datas) {
  return new Promise(function (resolve, reject) {
    var accountSid = 'AC32c5e4d582dd5c0b87b245f01d436ab1'; // Your Account SID from www.twilio.com/console
    var authToken = 'bfa27f2dc359c626f20f275ec2a63636';   // Your Auth Token from www.twilio.com/console
    var client = new twilio.RestClient(accountSid, authToken);
    client.messages.create({
        body: "yesi",
        to: '+262' + parseInt(datas.u.mobPhone).toString(),  // Text this number
        from: '+33644641541' // From a valid Twilio number
    }, function(err, message) {
        //if (err) return reject(err) // rejects the promise with `err` as the reason
        resolve(message) 
    });
  })
}

exports.testTwilio = function (req, res) {
    

}

exports.smsReceive = function(req, res)
{
    io.sockets.emit('numessag', req.body);
    console.log(req.body);
    res.type('text/xml');
    res.send("<Response></Response>");
}