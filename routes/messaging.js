var twilio = require('twilio');
exports.testTwilio = function (req, res) {
    var accountSid = 'AC32c5e4d582dd5c0b87b245f01d436ab1'; // Your Account SID from www.twilio.com/console
    var authToken = 'bfa27f2dc359c626f20f275ec2a63636';   // Your Auth Token from www.twilio.com/console
    var client = new twilio.RestClient(accountSid, authToken);
    client.messages.create({
        body: 'Hello from Node',
        to: '+262693336223',  // Text this number
        from: '+33644641541' // From a valid Twilio number
    }, function(err, message) {
        console.log("err",err);
        console.log(message.sid);
    });
}


exports.testSmsF = function (req, res) {
    var options = {
        host: 'https://api.smsfactor.com',
        port: 80,
        path: '/send',
        method: 'POST'
    };
    var json = {
        sms: {
            authentication: {
                username:"fab.grenouillet@gmail.com",
                password:"bibichoco"
            },
        "message": {
            "text": "Message via API",
            "senderid": "YESI"
        },
        "recipients": {
            "gsm": [
                {
                    "gsmsmsid": "100",
                    "value": "262693336223"
                }
            ]
        }
        }
    };

    http.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
    });
    }).end();
}


exports.smsReceive = function(req, res)
{
    console.log(req.body);
    res.send(true);
}