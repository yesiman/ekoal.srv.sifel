//process.env.MONGOHQ_URL
//const composeMongoCstr = process.env.MONGOHQ_URL;
var clients = [];
var port = (process.env.PORT ? process.env.PORT : 3000);
const composeMongoCstr = process.env.MONGOHQ_URL;
//
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    products = require('./routes/products'),
    orgas = require('./routes/orgas'),
    users = require('./routes/users'),
    planifs = require('./routes/planifs'),
    stats = require('./routes/stats'),
    rules = require('./routes/rules'),
    mailing = require('./routes/mailing'),
    messaging = require('./routes/messaging'),
    bodyParser = require('body-parser'),
    cors = require('cors');

jwt = require('jsonwebtoken');

var mongodb = require('mongodb'), MongoClient = mongodb.MongoClient
MongoClient.connect(composeMongoCstr, function (err, dbr) {
    db = dbr;
});


//client.ping({
//    // ping usually has a 3000ms timeout
//    requestTimeout: Infinity,

//    // undocumented params are appended to the query string
//    hello: "elasticsearch!"
//}, function (error) {
//    if (error) {
//        console.trace('elasticsearch cluster is down!');
//    } else {
//        console.log('All is well');
//    }
//});

//
server.listen(port, function() {
    //parts.findAll();
});
console.log("Server listening:" + port);
//MIDDLE
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
//START ROUTES
//AUTHENTIFICATION
app.post('/users/login', cors(), bodyParser.json(), users.login);
//END AUTHENTIFICATION
//MAILING
app.post('/mailing/sendMailRecover/', cors(), bodyParser.json(), mailing.sendMailRecover);
//END MAILING
app.get('/messaging/smsReceive/', cors(), bodyParser.json(), messaging.smsReceive);
app.post('/messaging/testSmsF/', cors(), bodyParser.json(), messaging.testSmsF);


//TOKEN VALIDATION
app.use(function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token)
    {
        jwt.verify(token, process.env.JWT, function(err, decoded) {      
            if (err) {
                return res.status(403).send({ 
                    success: false, 
                    message: 'Bad token or expired.' 
                });
            } else {
                req.decoded = decoded;    
                next();
            }
        });
    }
    else {
        return res.status(403).send({ 
            success: false, 
            message: 'No token provided.' 
        });
    }
});
//END TOKEN VALIDATION
//USERS
app.get('/users/clearAll', cors(), bodyParser.json(), users.clearAll);
app.get('/users/refreshToken', cors(), bodyParser.json(), users.refreshToken);
app.get('/users/get/:id', cors(), bodyParser.json(), users.get);
app.get('/users/getParcelles/:id', cors(), bodyParser.json(), users.getParcelles);
app.post('/users/getAll/:idp/:nbr', cors(), bodyParser.json(), users.getAll);
app.get('/users/getAllByType/:idp/:nbr/:idt', cors(), bodyParser.json(), users.getAllByType);
app.get('/users/getAllByOrga/:idp/:nbr/:ido', cors(), bodyParser.json(), users.getAllByOrga);
app.delete('/users/delete/:id', cors(), bodyParser.json(), users.delete);
app.post('/users/add/:id', cors(), bodyParser.json(), users.add);
//END USERS
//PRODS
app.get('/products/get/:id', cors(), bodyParser.json(), products.get);
app.get('/products/getAll/:idp/:nbr', cors(), bodyParser.json(), products.getAll);
app.get('/products/getAllByLib/:idp/:nbr/:req', cors(), bodyParser.json(), products.getAllByLib);
app.delete('/products/delete/:id', cors(), bodyParser.json(), products.delete);
app.post('/products/add/:id', cors(), bodyParser.json(), products.add);

app.get('/products/getAllFromDouane/:level/:parent', cors(), bodyParser.json(), products.getAllFromDouane);
//END PRODS
//ORGAS
app.get('/orgas/get/:id', cors(), bodyParser.json(), orgas.get);
app.get('/orgas/getAll/:idp/:nbr', cors(), bodyParser.json(), orgas.getAll);
app.delete('/orgas/delete/:id', cors(), bodyParser.json(), orgas.delete);
app.post('/orgas/add/:id', cors(), bodyParser.json(), orgas.add);
//END ORGAS
//PLANIFS
app.get('/planifs/get/:id', cors(), bodyParser.json(), planifs.get);
app.post('/planifs/add/:id', cors(), bodyParser.json(), planifs.add);
app.get('/planifs/getAll/:idp/:nbr', cors(), bodyParser.json(), planifs.getAll);
app.delete('/planifs/delete/:id', cors(), bodyParser.json(), planifs.delete);
//RULES
app.get('/rules/get/:id', cors(), bodyParser.json(), rules.get);
app.post('/rules/add/:id', cors(), bodyParser.json(), rules.add);
app.get('/rules/getAllByProduit/:id', cors(), bodyParser.json(), rules.getAllByProduit);
app.delete('/rules/delete/:id', cors(), bodyParser.json(), rules.delete);
//END RULES
//STATS
app.post('/stats/prevsByDay/', cors(), bodyParser.json(), stats.prevsByDay);
app.post('/stats/prevsByProd/', cors(), bodyParser.json(), stats.prevsByProducteur);
app.post('/stats/prevsPlanifsLines/:idp/:nbr', cors(), bodyParser.json(), stats.prevsPlanifsLines);

app.post('/messaging/testTwilio/', cors(), bodyParser.json(), messaging.testTwilio);

//END.ROUTES