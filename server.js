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
//USERS
app.get('/users/get/:id', cors(), bodyParser.json(), users.get);
app.get('/users/getAll', cors(), bodyParser.json(), users.getAll);
app.delete('/users/delete/:id', cors(), bodyParser.json(), users.delete);
app.post('/users/add/:id', cors(), bodyParser.json(), users.add);
//END USERS
//END.ROUTES