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

                var data = {
                    from: 'Sifel <no_reply@arifel.org>',
                    to: req.body.email,
                    subject: '[SIFEL].Vos identifiants de connexion',
                    html: html
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
exports.sendMailNotif = function (req, res) {
    //GET ORGA NOTIF EMAILS
    db.collection('orga', function (err, collection) {
        collection.findOne({ _id: new require('mongodb').ObjectID(req.decoded.orga) }, function (err, item) {
            if (item) {
                
                var html = "Bonjour, <br/><br/>"
                    + " Veuillez trouver ci-dessous vos identifiants de connexion : <br/>"
                    + "Identifiant : " + req.body.email + "<br/>"
                    + "Mot de passe : " + item.pass + "<br/><br/>"
                    + "A bientot";
                var data = {
                    from: 'Sifel <no_reply@arifel.org>',
                    to: "fab.grenouillet@gmail.com",
                    subject: '[SIFEL].Nouvelle notification',
                    html: html
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