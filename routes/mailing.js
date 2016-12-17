exports.sendMailRecover = function (req, res) {
    db.collection('users', function (err, collection) {
        collection.findOne({ email: req.body.mail }, function (err, item) {
            if (item) {
                var api_key = process.env.MAILGUN_API_KEY;
                var domain = process.env.MAILGUN_DOMAIN;
                var mailgun = require('mailgun-js')({ apiKey: api_key, domain: domain });

                var data = {
                    from: 'Arifel <no_reply@yesi.test>',
                    to: req.body.mail,
                    subject: 'Identifiants',
                    text: item.email + " " + item.pass
                };

                mailgun.messages().send(data, function (error, body) {
                    res.send({ success: true });
                });
                
            }
            else {
                res.send({ success: false });
            }

        })
    });
};