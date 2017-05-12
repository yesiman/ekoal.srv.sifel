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
    productsGroups = require('./routes/products_groups'),
    orgas = require('./routes/orgas'),
    users = require('./routes/users'),
    usersGroups = require('./routes/users_groups'),
    planifs = require('./routes/planifs'),
    stats = require('./routes/stats'),
    rules = require('./routes/rules'),
    mailing = require('./routes/mailing'),
    messaging = require('./routes/messaging'),
    importer = require('./routes/importer'),
    bodyParser = require('body-parser'),
    mongoOplog = require('mongo-oplog'),
    cors = require('cors'),
    multer = require('multer'),
    upload = multer().any(),
    moment = require('moment-timezone');
//
var oplogMessages = mongoOplog(composeMongoCstr, { ns: 'app52340846.messages' }).tail();
//
jwt = require('jsonwebtoken');
io = require('socket.io').listen(server);
//
var mongodb = require('mongodb'), MongoClient = mongodb.MongoClient
MongoClient.connect(composeMongoCstr, function (err, dbr) {
    db = dbr;
});
//
oplogMessages.on('update', function (doc) {
    var data = { message:"message"};
    io.sockets.emit('upd', data);
    console.log("nouvelle upd");
    console.log(doc);
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
setInterval(function(){
    console.log("Heroku Time",new Date());
    console.log("Paris Time",moment.tz(new Date().getTime(),"Europe/Paris").format());
    
    console.log("Reunion Time",moment.tz(new Date().getTime(),"Indian/Reunion").format());
    //messaging.sendSmsToProducteurs();
}, 1000);      

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
app.all('/messaging/smsReceive/', cors(), bodyParser.json(), messaging.smsReceive);
//
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
app.post('/users/getParcelles/:idp/:nbr/:id', cors(), bodyParser.json(), users.getParcelles);
app.post('/users/getAll/:idp/:nbr', cors(), bodyParser.json(), users.getAll);
app.get('/users/getAllByType/:idp/:nbr/:idt/:req', cors(), bodyParser.json(), users.getAllByType);
app.post('/users/getAllByOrga/:idp/:nbr/:ido', cors(), bodyParser.json(), users.getAllByOrga);
app.delete('/users/delete/:id', cors(), bodyParser.json(), users.delete);
app.delete('/users/deleteParcelle/:id', cors(), bodyParser.json(), users.deleteParcelle);
app.post('/users/add/:id', cors(), bodyParser.json(), users.add);
app.post('/users/addParcelle/:id', cors(), bodyParser.json(), users.addParcelle);
//GROUPS
app.get('/usersGroups/get/:id', cors(), bodyParser.json(), usersGroups.get);
app.get('/usersGroups/getAll/:idp/:nbr', cors(), bodyParser.json(), usersGroups.getAll);
app.delete('/usersGroups/delete/:id', cors(), bodyParser.json(), usersGroups.delete);
app.post('/usersGroups/add/:id', cors(), bodyParser.json(), usersGroups.add);
//END GROUPS
//END USERS
//PRODS
app.get('/products/get/:id', cors(), bodyParser.json(), products.get);
app.get('/products/getAll/:idp/:nbr', cors(), bodyParser.json(), products.getAll);
app.get('/products/getAllByLib/:idp/:nbr/:req', cors(), bodyParser.json(), products.getAllByLib);
app.delete('/products/delete/:id', cors(), bodyParser.json(), products.delete);
app.post('/products/add/:id', cors(), bodyParser.json(), products.add);
app.get('/products/getAllFromDouane/:level/:parent', cors(), bodyParser.json(), products.getAllFromDouane);
//GROUPS
app.get('/productsGroups/get/:id', cors(), bodyParser.json(), productsGroups.get);
app.get('/productsGroups/getAll/:idp/:nbr', cors(), bodyParser.json(), productsGroups.getAll);
app.delete('/productsGroups/delete/:id', cors(), bodyParser.json(), productsGroups.delete);
app.post('/productsGroups/add/:id', cors(), bodyParser.json(), productsGroups.add);
//END GROUPS
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
app.post('/planifs/getAll/:idp/:nbr', cors(), bodyParser.json(), planifs.getAll);
app.post('/planifs/getFinalFilters', cors(), bodyParser.json(), planifs.getAll);
app.delete('/planifs/delete/:id', cors(), bodyParser.json(), planifs.delete);
app.post('/planifs/groupDec', cors(), bodyParser.json(), planifs.groupDec);
app.post('/planifs/groupDup', cors(), bodyParser.json(), planifs.groupDup);
app.post('/planifs/groupChangeRule', cors(), bodyParser.json(), planifs.groupChangeRule);
//RULES
app.get('/rules/get/:id', cors(), bodyParser.json(), rules.get);
app.post('/rules/add/:id', cors(), bodyParser.json(), rules.add);
app.post('/rules/getAllByProduit/:idp/:nbr/:id', cors(), bodyParser.json(), rules.getAllByProduit);
app.delete('/rules/delete/:id', cors(), bodyParser.json(), rules.delete);
//END RULES
//STATS
app.post('/stats/prevsByDay/', cors(), bodyParser.json(), stats.prevsByDay);
app.post('/stats/prevsByProd/', cors(), bodyParser.json(), stats.prevsByProducteur);
app.post('/stats/prevsPlanifsLines/:idp/:nbr', cors(), bodyParser.json(), stats.prevsPlanifsLines);
app.post('/stats/prevsPlanifsLinesApplyPercent', cors(), bodyParser.json(), stats.prevsPlanifsLinesApplyPercent);
//
app.post('/messaging/testTwilio/', cors(), bodyParser.json(), messaging.testTwilio);

app.post('/importer/produits/', cors(), bodyParser.json(), upload, importer.produits);
app.post('/importer/producteurs/', cors(), bodyParser.json(), upload, importer.producteurs);
app.post('/importer/objectifs/', cors(), bodyParser.json(), upload, importer.objectifs);
app.post('/importer/parcelles/', cors(), bodyParser.json(), upload, importer.parcelles);
//END.ROUTES

Date.prototype.getWeek = function() { 

  // Create a copy of this date object  
  var target  = new Date(this.valueOf());  

  // ISO week date weeks start on monday, so correct the day number  
  var dayNr   = (this.getDay() + 6) % 7;  

  // Set the target to the thursday of this week so the  
  // target date is in the right year  
  target.setDate(target.getDate() - dayNr + 3);  

  // ISO 8601 states that week 1 is the week with january 4th in it  
  var jan4    = new Date(target.getFullYear(), 0, 4);  

  // Number of days between target date and january 4th  
  var dayDiff = (target - jan4) / 86400000;    

  if(new Date(target.getFullYear(), 0, 1).getDay() < 5) {
    // Calculate week number: Week 1 (january 4th) plus the    
    // number of weeks between target date and january 4th    
    return Math.ceil(dayDiff / 7);    
  }
  else {  // jan 4th is on the next week (so next week is week 1)
    return Math.ceil(dayDiff / 7); 
  }
};