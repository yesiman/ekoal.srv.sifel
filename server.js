//process.env.MONGOHQ_URL
//const composeMongoCstr = process.env.MONGOHQ_URL;
var clients = [];
var port = (process.env.PORT ? process.env.PORT : 3000);
//
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    parts = require('./routes/prods'),
    users = require('./routes/users'),
    bodyParser = require('body-parser'),
    cors = require('cors');

//CHECK




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
app.get('/users/hello', cors(), bodyParser.json(), users.hello);
//app.post('/node/cardwall/parts/saveBook', cors(), bodyParser.json(), parts.saveBook);
//app.get('/node/cardwall/parts/:idp/:nbr', cors(), bodyParser.json(), parts.findAll);
//END.ROUTES