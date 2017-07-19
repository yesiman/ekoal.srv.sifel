var mailgun = require('mailgun-js')({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN });
exports.sendMailRecover = function (req, res) {
    db.collection('users', function (err, collection) {
        collection.findOne({ email: req.body.email }, function (err, item) {
            if (item) {
                mailing.sendMail(req.body.email,"Vos identifiants de connexion",html);
            }
            else {
                res.send({ success: false });
            }
        })
    });
};
exports.sendMail = function (to, subject,body) {
    //GET ORGA NOTIF EMAILS
    return new Promise(function(resolve,reject) {
        var html = body;
        var data = {
            from: 'Sifel <no_reply@arifel.org>',
            to: to,
            subject: '[SIFEL].' + subject,
            html: html
        };
        mailgun.messages().send(data, function (error, body) {
            res.send({ success: true });
        });
    });
};