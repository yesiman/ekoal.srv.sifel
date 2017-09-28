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
    productsCondits = require('./routes/products_condits'),
    productsCategs = require('./routes/products_categs'),
    stations = require('./routes/stations'),
    bons = require('./routes/bons'),
    orgas = require('./routes/orgas'),
    clientsR = require('./routes/clients'),
    facturation = require('./routes/facturation'),
    users = require('./routes/users'),
    usersGroups = require('./routes/users_groups'),
    planifs = require('./routes/planifs'),
    stats = require('./routes/stats'),
    fromMobile = require('./routes/from_mobile'),
    rules = require('./routes/rules'),
    messaging = require('./routes/messaging'),
    importer = require('./routes/importer'),
    bodyParser = require('body-parser'),
    mongoOplog = require('mongo-oplog'),
    cors = require('cors'),
    multer = require('multer'),
    upload = multer().any();
//
var oplogMessages = mongoOplog(composeMongoCstr, { ns: 'app52340846.messages' }).tail();
//
jwt = require('jsonwebtoken');
io = require('socket.io').listen(server);
shared = require('./routes/_shared');
mailing = require('./routes/mailing');
//
var mongodb = require('mongodb'), MongoClient = mongodb.MongoClient
MongoClient.connect(composeMongoCstr, function (err, dbr) {
    db = dbr;
    /*db.collection('products', function (err, collection) {
        collection.update(
            { },{ $set:{actif: true} }, {multi:true}, 
            function(err, results) {
                db.collection('parcelles', function (err, collection) {
                    collection.update(
                        { },{ $set:{actif: true} }, {multi:true}, 
                        function(err, results) {
                            db.collection('users', function (err, collection) {
                                collection.update(
                                    { },{ $set:{actif: true} }, {multi:true}, 
                                    function(err, results) {
                                        
                                    });
                            });
                        });
                });
            });
    });*/
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
    messaging.sendSmsToProducteurs();
}, 30000);      

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
app.post('/users/getParcellesByProducteurs/:idp/:nbr', cors(), bodyParser.json(), users.getParcellesByProducteurs);

app.get('/users/getParcellesGeo/', cors(), bodyParser.json(), users.getParcellesGeo);

//
app.post('/users/getAll/:idp/:nbr/:ts', cors(), bodyParser.json(), users.getAll);
//
app.post('/users/getAll/:idp/:nbr', cors(), bodyParser.json(), users.getAll);
app.get('/users/getAllByType/:idp/:nbr/:idt/:req', cors(), bodyParser.json(), users.getAllByType);
app.get('/users/getAllByType/:idp/:nbr/:idt/:req/:actifs', cors(), bodyParser.json(), users.getAllByType);
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
app.get('/products/getAll/:idp/:nbr/:ts', cors(), bodyParser.json(), products.getAll);
app.get('/products/getAllByLib/:idp/:nbr/:req', cors(), bodyParser.json(), products.getAllByLib);
app.get('/products/getAllByLib/:idp/:nbr/:req/:actifs', cors(), bodyParser.json(), products.getAllByLib);
app.post('/products/getAllByIds', cors(), bodyParser.json(), products.getAllByIds);
app.delete('/products/delete/:id', cors(), bodyParser.json(), products.delete);
app.post('/products/add/:id', cors(), bodyParser.json(), products.add);
app.get('/products/getAllFromDouane/:level/:parent', cors(), bodyParser.json(), products.getAllFromDouane);
//GROUPS
app.get('/productsGroups/get/:id', cors(), bodyParser.json(), productsGroups.get);
app.get('/productsGroups/getAll/:idp/:nbr', cors(), bodyParser.json(), productsGroups.getAll);
app.delete('/productsGroups/delete/:id', cors(), bodyParser.json(), productsGroups.delete);
app.post('/productsGroups/add/:id', cors(), bodyParser.json(), productsGroups.add);
//END GROUPS
//CONDITS
app.get('/productsCondits/get/:id', cors(), bodyParser.json(), productsCondits.get);
app.get('/productsCondits/getAll/:idp/:nbr', cors(), bodyParser.json(), productsCondits.getAll);
app.get('/productsCondits/getAll/:idp/:nbr/:ts', cors(), bodyParser.json(), productsCondits.getAll);
app.delete('/productsCondits/delete/:id', cors(), bodyParser.json(), productsCondits.delete);
app.post('/productsCondits/add/:id', cors(), bodyParser.json(), productsCondits.add);
//END CONDITS
//CALIBRS
app.get('/productsCategs/get/:id', cors(), bodyParser.json(), productsCategs.get);
app.get('/productsCategs/getAll/:idp/:nbr', cors(), bodyParser.json(), productsCategs.getAll);
app.get('/productsCategs/getAll/:idp/:nbr/:ts', cors(), bodyParser.json(), productsCategs.getAll);
app.delete('/productsCategs/delete/:id', cors(), bodyParser.json(), productsCategs.delete);
app.post('/productsCategs/add/:id', cors(), bodyParser.json(), productsCategs.add);
//END CALIBRS
//END PRODS
//ORGAS
app.get('/orgas/get/:id', cors(), bodyParser.json(), orgas.get);
app.get('/orgas/getAll/:idp/:nbr', cors(), bodyParser.json(), orgas.getAll);
app.delete('/orgas/delete/:id', cors(), bodyParser.json(), orgas.delete);
app.post('/orgas/add/:id', cors(), bodyParser.json(), orgas.add);
//END ORGAS
//FACTURES
app.get('/facturation/get/:id', cors(), bodyParser.json(), facturation.get);
app.post('/facturation/getAll/:idp/:nbr', cors(), bodyParser.json(), facturation.getAll);
app.delete('/facturation/delete/:id', cors(), bodyParser.json(), facturation.delete);
app.post('/facturation/add/:id', cors(), bodyParser.json(), facturation.add);
//END FACTURES
//CLIENTS
app.get('/clients/get/:id', cors(), bodyParser.json(), clientsR.get);
app.get('/clients/getAll/:idp/:nbr', cors(), bodyParser.json(), clientsR.getAll);
app.get('/clients/getAll/:idp/:nbr/:ts', cors(), bodyParser.json(), clientsR.getAll);
app.get('/clients/getAllByLib/:idp/:nbr/:req', cors(), bodyParser.json(), clientsR.getAllByLib);
app.delete('/clients/delete/:id', cors(), bodyParser.json(), clientsR.delete);
app.post('/clients/add/:id', cors(), bodyParser.json(), clientsR.add);
//END CLIENTS
//STATIONS
app.get('/stations/get/:id', cors(), bodyParser.json(), stations.get);
app.get('/stations/getAll/:idp/:nbr', cors(), bodyParser.json(), stations.getAll);
app.get('/stations/getAll/:idp/:nbr/:ts', cors(), bodyParser.json(), stations.getAll);
app.delete('/stations/delete/:id', cors(), bodyParser.json(), stations.delete);
app.post('/stations/add/:id', cors(), bodyParser.json(), stations.add);
//END STATIONS
//BONS
app.get('/bons/get/:id', cors(), bodyParser.json(), bons.get);
app.post('/bons/getAll/:idp/:nbr', cors(), bodyParser.json(), bons.getAll);
app.post('/bons/getStatGlobal/', cors(), bodyParser.json(), bons.getStatGlobal);
app.post('/bons/getStatProduits/', cors(), bodyParser.json(), bons.getStatProduits);
app.post('/bons/getStatProducteurs/', cors(), bodyParser.json(), bons.getStatProducteurs);
app.post('/bons/getStatStations/', cors(), bodyParser.json(), bons.getStatStations);
//
app.post('/bons/getStatProduitsExp/', cors(), bodyParser.json(), bons.getStatProduitsExp);
//app.post('/bons/getStatProducteursExp/', cors(), bodyParser.json(), bons.getStatProducteursExp);
//app.post('/bons/getStatStationsExp/', cors(), bodyParser.json(), bons.getStatStationsExp);
//
app.delete('/bons/delete/:id', cors(), bodyParser.json(), bons.delete);
app.post('/bons/add/:id', cors(), bodyParser.json(), bons.add);
app.post('/bons/getLc', cors(), bodyParser.json(), bons.getLc);
//END BONS
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
app.post('/stats/getDataFile/:numFile', cors(), bodyParser.json(), stats.getDataFile);
//
app.post('/stats/agreageByProducteur/', cors(), bodyParser.json(), stats.agreageByProducteur);
//
app.post('/messaging/testTwilio/', cors(), bodyParser.json(), messaging.testTwilio);
//
app.post('/importer/clients/', cors(), bodyParser.json(), upload, importer.clients);
app.post('/importer/rulesi/', cors(), bodyParser.json(), upload, importer.rulesi);
app.post('/importer/produits/', cors(), bodyParser.json(), upload, importer.produits);
app.post('/importer/producteurs/', cors(), bodyParser.json(), upload, importer.producteurs);
app.post('/importer/objectifs/', cors(), bodyParser.json(), upload, importer.objectifs);
app.post('/importer/parcelles/', cors(), bodyParser.json(), upload, importer.parcelles);
//
app.post('/frommobile/uploadDatas/', cors(), bodyParser.json(), fromMobile.uploadDatas);
app.post('/frommobile/uploadBon/', cors(), bodyParser.json(), fromMobile.uploadBon);
app.post('/frommobile/uploadParc/', cors(), bodyParser.json(), fromMobile.uploadParc);
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
