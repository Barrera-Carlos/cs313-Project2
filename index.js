const express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var session = require('express-session');
const path = require('path');
const { Client } = require('pg');

var currentRoom = null;

var port = process.env.PORT || 5000;

//const connectionString = "dbname=d5jgh9e9r7rs3k host=ec2-54-235-146-51.compute-1.amazonaws.com port=5432 user=tukubqgepkcvtn password=a621abf6cdfaaf67344840e60ae648a52ea542d59007c21828b1699c31c61c1b sslmode=require";
app.use(session({
  secret: 'tati',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 600000
  }
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
  var cookieId = req.session.id
  getChatrooms(function(error, result){
    if(error){
      res.send(error);
    }
    else {
      res.send(result);
    }
  })
});

app.get('/chooseroom',function(req,res){
  currentRoom = req.query.rooms[0];
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/enterRoom',function(req,res){
  res.send(currentRoom);
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
        var qUserName = result[0].username;
        var disName = result[0].display_name;

        if(password == psw && userName == qUserName){
          console.log(qUserName);
          req.session.id = id;
          var cookieId = req.session.id;
          checkForUser(id, function(error, result){
            if(error || result == null){
              res.status(500).json({success: false, data: error});
            }else if (result.length == 0 && error == null) {
              queryCookie(id,disName,cookieId, function(error){
                if (error) {
                  res.status(500).json({success: false, data: error});
                } else {
                  res.sendFile( __dirname + "/public/" +'chooseRoom.html');
              }});
            }else{
              getUserData(cookieId, function(error,result){
                if(result.length == 0){
                  deletequeryCookie(id,function(error){
                    if(error){
                      res.status(500).json({success: false, data: error});
                    }
                    else {
                      queryCookie(id,disName,cookieId, function(error){
                        if (error) {
                          res.status(500).json({success: false, data: error});
                        } else {
                          res.sendFile( __dirname + "/public/" +'chooseRoom.html');
                      }});
                    }
                  })
                }
                else {
                  res.sendFile( __dirname + "/public/" +'chooseRoom.html');
                }
              });
            }
          });
  		}
  	}
  });
}

function checkForUser(id,callback){
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

    var qur = "SELECT * FROM public.sessionStore WHERE user_id = "+"\'"+ id +"\'";
    console.log(qur);
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

function deletequeryCookie(id, callback){
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

    var qur = "DELETE FROM public.sessionStore WHERE user_id = "+"\'"+ id +"\'";
    console.log(qur);
    var query = client.query(qur, function(err, result) {
    // we are now done getting the data from the DB, disconnect the client
      client.end(function(err) {
        if (err) throw err;
      });

      if (err) {
      console.log(qur);
      console.log("Error in query: ")
      console.log(err);
      callback(err);
    }
    callback(null);
    });
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

function queryCookie (id,disName,cookieId,callback){
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

    var qur = "INSERT INTO public.sessionStore (cookie_id,user_id,display_name) VALUES("+"\'"+ cookieId +"\',"+"\'"+ id +"\',"+"\'"+ disName +"\')";
    console.log(qur);
    var query = client.query(qur, function(err, result) {
    // we are now done getting the data from the DB, disconnect the client
      client.end(function(err) {
        if (err) throw err;
      });

      if (err) {
      console.log(qur);
      console.log("Error in query: ")
      console.log(err);
      callback(err);
    }
    callback(null);
    });
  });
}

function getUserData(Id, callback){
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

    var qur = "SELECT * FROM public.sessionStore WHERE cookie_id = "+"\'"+ Id +"\'";
    console.log(qur);
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

function getChatrooms(callback){
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

    var qur = "SELECT room_name FROM public.chat_room";
    console.log(qur);
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
  //this socket.on will joint a room
  socket.on('join', function(msg){
    if(msg == currentRoom){
      console.log(msg is the same as room);
    }
    socket.join(currentRoom);
  });

  //this socket.on recives the messege and emit mesg
  socket.on('chat message', function(msg){
    io.to(currentRoom).emit(msg)
    //io.emit('chat message', msg);
  });

  /*this socket.on will leave the room
  socket.on('chat message', function(msg){
    //socket.leave(name of room in a string format)
  });*/
});

http.listen(port, function(){
  console.log('listening on:' + port);
});
