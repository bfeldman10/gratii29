var express = require('express')
  , http 	= require('http')
  , request = require('request');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
server.listen(8001, '0.0.0.0');

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

  request('http://localhost/gratii29/backend/public/api/v1/auction/winners', function (error, response, body) {
    console.log('Requested Auction Winners');
  });

}, 60000);

setInterval(function () {
  console.log('Refreshing auctions');
  request('http://localhost/gratii29/backend/public/api/v1/auction/refresh', function (error, response, body) {
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

