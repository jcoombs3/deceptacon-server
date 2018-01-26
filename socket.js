
express = require('express');  
var app = express();  
var server = require('http').createServer(app);  
var io = require('socket.io')(server);

app.use(express.static("www")); 
// Our Ionic app build is in the www folder 
// (kept up-to-date by the Ionic CLI using 'ionic serve')

server.listen(4200, function(){
  console.log('listening on *:4200');
});

io.on('connection', function(socket) {  
    console.log('++ a client connected...');
  
    socket.on('com.deceptacon.event', function (arr) {
      console.log('++ com.deceptacon.event', arr.event);
      io.sockets.emit(arr.event, arr.data);
    });
});