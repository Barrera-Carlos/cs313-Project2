const express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const path = require('path');
var pg = require("pg");

var port = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

//listen for a connection
//the socket parameter is a scoket every
//new memeber will have
io.on('connection', function(socket){
  //obtain and emit mesg
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

http.listen(port, function(){
  console.log('listening on:' + port);
});
