var mailgun = require('mailgun-js')({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN });
exports.sendMailRecover = function (req, res) {
    db.collection('users', function (err, collection) {
        collection.findOne({ email: req.body.email }, function (err, item) {
            if (item) {
                var html = "Bonjour, <br/><br/>"
                    + " Veuillez trouver ci-dessous vos identifiants de connexion : <br/>"
                    + "Identifiant : " + req.body.email + "<br/>"
                    + "Mot de passe : " + item.pass + "<br/><br/>"
                    + "A bientot";
                mailing.sendMail(req.body.email,"Vos identifiants de connexion",html);
                res.send({ success: true });
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
            html: body
        };
        mailgun.messages().send(data, function (error, body) {
            //res.send({ success: true });
        });
    });
};