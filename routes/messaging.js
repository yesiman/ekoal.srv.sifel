var twilio = require('twilio');
var Client = require('node-rest-client').Client;

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
        res.send(true);
    });
}


exports.testSmsF = function (req, res) {
    var client = new Client();
    var json = {
        "sms": {
            "authentication": {
                "username":"fab.grenouillet@gmail.com",
                "password":"bibichoco"
            },
            "message": {
                "text": "Message via API"
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
    var args = {
        data: json,
        headers: { "Accept": "application/json","Content-Type": "application/json" }
    };
    
    client.post("https://api.smsfactor.com/send", args, function (data, response) {
        // parsed response body as js object 
        console.log(data);
        // raw response 
        //console.log(response);
        res.send(true);
    });


    
}


exports.smsReceive = function(req, res)
{
    console.log("RECEIVE");
    console.log(req.body);
    res.send(true);
}