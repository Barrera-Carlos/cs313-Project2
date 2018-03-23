const express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const path = require('path');
var pg = require("pg");

var port = process.env.PORT || 5000;

const connectionString = "postgres://tukubqgepkcvtn:a621abf6cdfaaf67344840e60ae648a52ea542d59007c21828b1699c31c61c1b@ec2-54-235-146-51.compute-1.amazonaws.com:5432/d5jgh9e9r7rs3k";

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});


app.get('/signUp', function(req,res){
    signUp(req,res);
  });


function signUp(req,res){
  var userName = req.query.name;
  var displayName = req.query.Dname;
  var password = req.query.psw;
  console.log(userName);
  console.log(displayName);
  console.log(password);

  //should serch before add user of in add user function?
  //searchForUserName();

  addUserToDb(userName,displayName,password, function(error, result) {
		// This is the callback function that will be called when the DB is done.
		// The job here is just to send it back.

		// Make sure we got a row with the person, then prepare JSON to send back
		if (error || result == null || result.length != 1) {
			response.status(500).json({success: false, data: error});
		} else {
			var person = result[0];
			response.status(200).json(result[0]);
		}
	});
}

function addUserToDb(userName,displayName,password,callback){
  var client = new pg.Client(connectionString);

  client.connect(function(err){
    if(err){
      console.log("was not able to connect to the DB: ");
      console.log(err);
      callback(err,null);
    }
    else {
      console.log("i think im connected :)");
    }
  })
}
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
