exports.sendMailRecover = function (req, res) {
    db.collection('users', function (err, collection) {
        console.log("req.body.mail", req.body.email);
        collection.findOne({ email: req.body.email }, function (err, item) {
            if (item) {
                console.log("item", item);
                var api_key = process.env.MAILGUN_API_KEY;
                var domain = process.env.MAILGUN_DOMAIN;
                var mailgun = require('mailgun-js')({ apiKey: api_key, domain: domain });

                var html = "Bonjour, \r\n\r\n"
                    + " Veuillez trouver ci-dessous vos identifiants de conexion : \r\n"
                    + "Identifiant : " + req.body.email + "\r\n"
                    + "Mot de passe : " + item.pass + "\r\n\r\n"
                    + "A bientot";

                var data = {
                    from: 'Arifel <no_reply@arifel.org>',
                    to: req.body.email,
                    subject: 'Vos Identifiants de connexion',
                    html: html
                };

                mailgun.messages().send(data, function (error, body) {
                    console.log(req.body.email);
                    console.log(error);

                    res.send({ success: true });
                });
                
            }
            else {
                res.send({ success: false });
            }

        })
    });
};