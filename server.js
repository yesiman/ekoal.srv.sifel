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
//TOKEN VALIDATION
app.use(function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token)
    {
        jwt.verify(token, process.env.JWT, function(err, decoded) {      
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });    
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
app.get('/users/get/:id', cors(), bodyParser.json(), users.get);
app.get('/users/getAll/:idp/:nbr', cors(), bodyParser.json(), users.getAll);
app.get('/users/getAllByType/:idp/:nbr/:idt', cors(), bodyParser.json(), users.getAllByType);
app.delete('/users/delete/:id', cors(), bodyParser.json(), users.delete);
app.post('/users/add/:id', cors(), bodyParser.json(), users.add);
//END USERS
//PRODS
app.get('/products/get/:id', cors(), bodyParser.json(), products.get);
app.get('/products/getAll/:idp/:nbr', cors(), bodyParser.json(), products.getAll);
app.get('/products/getAllByLib/:idp/:nbr/:req', cors(), bodyParser.json(), products.getAllByLib);
app.delete('/products/delete/:id', cors(), bodyParser.json(), products.delete);
app.post('/products/add/:id', cors(), bodyParser.json(), products.add);
//END PRODS
//PRODS
app.get('/orgas/get/:id', cors(), bodyParser.json(), orgas.get);
app.get('/orgas/getAll/:idp/:nbr', cors(), bodyParser.json(), orgas.getAll);
app.delete('/orgas/delete/:id', cors(), bodyParser.json(), orgas.delete);
app.post('/orgas/add/:id', cors(), bodyParser.json(), orgas.add);
//END PRODS

//END.ROUTES