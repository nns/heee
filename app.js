
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
	sio = require('socket.io')

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', routes.index);

app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);


var io = sio.listen(app);
io.configure(function () {
  io.set('log level', 1); 
  io.set('transports', [
    'websocket'
    //'flashsocket'
    ,'htmlfile'
    ,'xhr-polling'
    , 'jsonp-polling'
  ]);
});


var counter = 0;
var usrs = {};
var ua = [];


io.sockets.on('connection',function(socket){

	usrs[socket.id] = socket.uid = socket.id;
	ua.push(0);
	socket.emit('user',usrs);
	socket.broadcast.emit('user',{id:socket.id});

	socket.on('heee',function(){
		counter++;
		io.sockets.emit('button',socket.id);
	});
	socket.on('disconnect',function(){
		delete usrs[socket.uid];
		socket.broadcast.emit('dis',socket.id);
		ua.shift();
	});

});
setInterval(function(){
	require('util').log('counter='+counter + ':users='+ua.length);
	io.sockets.emit('add',counter);
	counter = 0;
},1000);
