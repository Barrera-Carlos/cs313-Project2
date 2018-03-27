const express = require('express');
var app = express();
app.use(require('morgan')('dev'));
var http = require('http').Server(app);
var io = require('socket.io')(http);
var session = require('express-session');
var FileStore = require('session-file-store')(session);
const path = require('path');
const { Client } = require('pg');

var port = process.env.PORT || 5000;

//const connectionString = "dbname=d5jgh9e9r7rs3k host=ec2-54-235-146-51.compute-1.amazonaws.com port=5432 user=tukubqgepkcvtn password=a621abf6cdfaaf67344840e60ae648a52ea542d59007c21828b1699c31c61c1b sslmode=require";
app.use(session({
  secret:'tati',
  saveUninitialized: true,
  resave: false,
  store: new FileStore()
}));
app.use(express.static(path.join(__dirname, '/public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});


app.get('/signUp', function(req,res){
    signUp(req,res);
  });

  app.get('/logIn',function(req,res){
    logIn(req,res);
  });

app.get('/ajaxcall',function(req,res){
  var psw = req.session.password;
  var id = req.session.id
  var disName = req.session.disName
  var data = {
    displayName: `${disName}`,
    id: `why are you not working ${id}`
  };
  res.send(data);
})
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
  /*var client = new pg.Client(connectionString);

  client.connect(function(err){
    if(err){
      console.log("was not able to connect to the DB: ");
      console.log(err);
      callback(err,null);
    }
    else {
      console.log("i think im connected :)");
    }
  });*/

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  });

  client.connect(function(err){
    if(err){

      console.log("was not able to connect to the DB: ");
      console.log(err);
      callback(err,null);
    }
    else {
      console.log("i think im connected :)");
    }
  });

}

function logIn(req,res){
    var userName = req.query.name;
    var password = req.query.psw;
    console.log(userName);
    console.log(password);

    getUser(userName,password, function(error, result) {
  		// This is the callback function that will be called when the DB is done.
  		// The job here is just to send it back.

  		// Make sure we got a row with the person, then prepare JSON to send back
  		if (error || result == null || result.length != 1) {
  			res.status(500).json({success: false, data: error});
  		} else {
        var psw = result[0].password;
        var id = result[0].id;
        var disName = result[0].display_name;
        console.log(disName);
        req.session.password = psw;
        req.session.id = 1;
        req.session.disName = disName;
  			res.sendFile( __dirname + "/public/" +'chooseRoom.html');
  		}
  	});
  }

function getUser(userName,password, callback){
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: true,
    });

    client.connect(function(err){
      if(err){

        console.log("was not able to connect to the DB: ");
        console.log(err);
        callback(err,null);
      }

      var qur = "SELECT * FROM public.user WHERE password = "+"\'"+ password +"\'";

      var query = client.query(qur, function(err, result) {
			// we are now done getting the data from the DB, disconnect the client
  			client.end(function(err) {
  				if (err) throw err;
  			});

        if (err) {
        console.log(qur);
				console.log("Error in query: ")
				console.log(err);
				callback(err, null);
			}

      console.log("Found result: " + JSON.stringify(result.rows));
      callback(null, result.rows);
      });
    });
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
