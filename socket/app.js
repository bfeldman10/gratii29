var express = require('express')
  , http 	= require('http')
  , request = require('request');

var app = express();
var server = http.createServer(app).listen(8001);
var io = require('socket.io').listen(server);
var rootURL = "http://gratii.com:8888/gratii29";
// var rootURL = "http://localhost:8888/gratii29";

//app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.urlencoded());
app.use(express.json());
//app.use(express.methodOverride());
app.use(app.router);
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.send(500, 'Something broke dude!');
});

app.get('/', function (req, res) {
	console.log('GET to SLASH....');
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
	socket.emit('connectionEstablished', { 'userNodeID': socket.id });
  	// socket.on('my other event', function (data) {
   //  	console.log(data);
  	// });
});

app.post('/command/transaction', function (req, res) {
	  console.log('POST to command/transaction recieved....');
    //console.log(req.body);

  	io.sockets.socket(req.body.userNodeID).emit('incomingTransaction', req.body);

  	res.writeHead(200, {"Content-Type": "text/json"});
    res.end('success');
});

app.put('/command/auction/:auctionID', function(req, res){

   	console.log('PUT to /command/auction/:auctionID recieved....');
   // console.log( req.body );

    io.sockets.emit('auctionUpdate', req.body);

    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end('success');
});

app.post('/command/msg', function(req, res){

    console.log('POST to /command/msg recieved....');
    //console.log( req.body );
    console.log( 'NEW MSG for: ' + req.body.userNodeID );

    io.sockets.socket(req.body.userNodeID).emit('incomingMessage', req.body);

    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end('success');

});

setInterval(  function(){

  console.log('Requesting Auction Winners');

  request(rootURL+'/backend/public/api/v1/auction/winners', function (error, response, body) {
    console.log('Requested Auction Winners');
  });

}, 60000);

setInterval(function () {
  console.log('Refreshing auctions');
  request(rootURL+'/backend/public/api/v1/auction/refresh', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      //console.log(body) // Print the google web page.
      var data =  JSON.parse(body);
      console.log( data.results );
      //data.results = true;
      if (data.results) {
        io.sockets.emit('auctionRefresh', '');
      }
    }
    console.log('Refreshed auctions');
  });
}, 60000);


// Set a time of day to run a functions every 24 hours ***************************
var now = new Date();
var millisTill4 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 04, 0, 0, 0) - now;
if (millisTill4 < 0) {
     millisTill4 += 86400000; // it's after 10am, try 10am tomorrow.
}

setTimeout(function(){
  setInterval(function(){
    request(rootURL+'/backend/public/api/v1/cron/like/buckets', function (error, response, body) {
      console.log('Requested Like Payout Buckets');
    });
  }, 86400000);
}, millisTill4);

var millisTill415 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 04, 15, 0, 0) - now;
if (millisTill415 < 0) {
     millisTill415 += 86400000; // it's after 10am, try 10am tomorrow.
}

setTimeout(function(){
  setInterval(function(){
    request(rootURL+'/backend/public/api/v1/cron/follow/buckets', function (error, response, body) {
      console.log('Requested Like Payout Buckets');
    });
  }, 86400000);
}, millisTill415);

var millisTill430 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 04, 30, 0, 0) - now;
if (millisTill430 < 0) {
     millisTill430 += 86400000; // it's after 10am, try 10am tomorrow.
}

setTimeout(function(){
  setInterval(function(){
    request(rootURL+'/backend/public/api/v1/cron/like/buckets', function (error, response, body) {
      console.log('Requested Like Payout Buckets');
    });
  }, 86400000);
}, millisTill430);
// End daily functions ***************************
