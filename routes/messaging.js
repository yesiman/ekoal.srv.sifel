var twilio = require('twilio');
var Client = require('node-rest-client').Client;

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
    res.send({ok:true});
}