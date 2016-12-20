exports.sendMailRecover = function (req, res) {
    db.collection('users', function (err, collection) {
        collection.findOne({ email: req.body.email }, function (err, item) {
            if (item) {
                var api_key = process.env.MAILGUN_API_KEY;
                var domain = process.env.MAILGUN_DOMAIN;
                var mailgun = require('mailgun-js')({ apiKey: api_key, domain: domain });

                var html = "Bonjour, <br/><br/>"
                    + " Veuillez trouver ci-dessous vos identifiants de conexion : <br/>"
                    + "Identifiant : " + req.body.email + "<br/>"
                    + "Mot de passe : " + item.pass + "<br/><br/>"
                    + "A bientot";

                var data = {
                    from: 'Arifel <no_reply@arifel.org>',
                    to: req.body.email,
                    subject: 'Vos Identifiants de connexion',
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