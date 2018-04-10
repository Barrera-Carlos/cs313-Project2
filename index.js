const express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var session = require('express-session');
const path = require('path');
const { Client } = require('pg');
var bcrypt = require('bcrypt');
const saltRounds = 10;


var currentRoom = null;

var port = process.env.PORT || 5000;

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
  res.sendFile(__dirname + '/public/logIn.html');
});

app.get('/signUp', function(req,res){
    signUp(req,res);
  });

app.get('/signUpPage', function(req,res){
  res.sendFile(__dirname + '/public/signUp.html');
});

app.get('/logIn',function(req,res){
    logIn(req,res);
  });

app.get('/ajaxcall',function(req,res){
  getChatrooms(function(error, result){
    if(error){
      res.send(error);
    }
    else {
      res.send(result);
    }
  })
});

app.get('/ajaxcallFav', function(req,res){
  var cookeId = req.session.id;

  getUserId(cookeId, function(req1,userId){
    if(userId != null){
      var id = userId[0].user_id
      getFavRoomId(id,function(error,result){
        if(result != null){
          getFavRoomName(function(er,roomName){
            if(roomName != null){
              var nameArr = new Array();
              for(var i = 0; i < result.length; i ++){
                for(var j = 0; j < roomName.length; j++){
                  if(result[i].room_id == roomName[j].id){
                    var roomInfo = {id:roomName[j].id, room_name:roomName[j].room_name};
                    nameArr.push(roomInfo);
                  }
                }
              }
              if(nameArr.length >= 1){
                console.log("the obj =" + JSON.stringify(nameArr));
                res.send(nameArr);
              }
              else {
                res.send("You dont have any Rooms Saved");
              }
            }
          });
            }
          else {
            res.send("You dont have any Rooms Saved");
          }
          });
        }
        else {
          res.send("no User found");
        }
      });
    });

app.get('/chooseroom',function(req,res){
  currentRoom = req.query.rooms[0];
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/enterRoom',function(req,res){
  res.send(currentRoom);
});

app.get('/addRoom',function(req,res){
  var newRoom = req.query.mytext;
  addRoom(newRoom, function(error,result){
    if(error == null && result == null){
      res.sendFile(__dirname + '/public/chooseRoom.html');
    }
    else {
      //figure our a good error
      res.sendFile(__dirname + '/public/chooseRoom.html');
    }
  });
});

app.get('/addRoomToFav',function(req,res){
  var room = req.query.rooms[0];
    var cookieId = req.session.id;
    getUserId(cookieId,function(err,respond){
      if(err == null){
        var roomInfo = {userId: respond[0].user_id, roomId: room};
        addFavRoom(roomInfo, function(error, result){
          if(error == null){
            res.sendFile(__dirname + '/public/chooseRoom.html');
          }
          else {
            console.log("error in addig fav room");
            res.sendFile(__dirname + '/public/chooseRoom.html');
          }
        });
      }
      else {
        console.log("no user ID");
        res.sendFile(__dirname + '/public/chooseRoom.html');
      }
    });
});

app.get('/deleteRoom',function(req,res){
  var cookieId = req.session.id;
  var room = req.query.rooms[0];
  getUserId(cookieId,function(err,respond){
    if(err == null){
      var roomInfo = {userId: respond[0].user_id, roomId: room};
      deleteRoom(roomInfo, function(error,result){
        if(error == null){
          res.sendFile(__dirname + '/public/chooseRoom.html');
        }
        else {
          console.log("could not delete room");
          res.sendFile(__dirname + '/public/chooseRoom.html');
        }
      })
    }
    else {
      console.log("no user ID");
      res.sendFile(__dirname + '/public/chooseRoom.html');
    }
  });
})

function signUp(req,res){
  var userName = req.query.name;
  var displayName = req.query.Dname;
  var password = req.query.psw;

  //should serch before add user of in add user function?
  //searchForUserName();

  bcrypt.hash(password,saltRounds, function(err,hash){
    addUserToDb(userName,displayName,hash, function(error) {
  		// This is the callback function that will be called when the DB is done.
  		// The job here is just to send it back.

  		// Make sure we got a row with the person, then prepare JSON to send back
  		if (error) {
  			res.status(500).json({success: false, data: error});
  		} else {
  			res.sendFile(__dirname + '/public/logIn.html');
  		}
  	});
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
      var qur = "INSERT INTO public.user (username,password,display_name) VALUES("+"\'"+ userName +"\',"+"\'"+ password +"\',"+"\'"+ displayName +"\')";
      console.log(qur);
      var query = client.query(qur, function(err, result) {
      // we are now done getting the data from the DB, disconnect the client
        client.end(function(err) {
          if (err) throw err;
        });

        if (err) {
        console.log(qur);
        console.log("Error in query: ")
        callback(err);
      }

      callback(null);
      });
    });
  }

function logIn(req,res){
    var userName = req.query.name;
    var password = req.query.psw;

    getUser(userName,password, function(error, result) {
  		// This is the callback function that will be called when the DB is done.
  		// The job here is just to send it back.

  		// Make sure we got a row with the person, then prepare JSON to send back
  		if (error || result == null || result.length != 1) {
  			res.status(500).json({success: false, data: error});
  		} else {
        var id = result[0].id;
        var qUserName = result[0].username;
        var disName = result[0].display_name;

        console.log(qUserName);
        req.session.id = id;
        var cookieId = req.session.id;
        checkForUser(id, function(error, result){
          if(error || result == null){
              res.status(500).json({success: false, data: error});
          }
          else if (result.length == 0 && error == null) {
            queryCookie(id,disName,cookieId, function(error){
              if (error) {
                res.status(500).json({success: false, data: error});
              }
              else {
                res.sendFile( __dirname + "/public/" +'chooseRoom.html');
              }
            });
            }
            else{
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
                        }
                        else {
                          res.sendFile( __dirname + "/public/" +'chooseRoom.html');
                      }
                    });
                    }
                  });
                }
                else {
                  res.sendFile( __dirname + "/public/" +'chooseRoom.html');
                }
              });
            }
          });
  	}
  });
}

function getUserId(id,callback){
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

    var qur = "SELECT user_id FROM public.sessionStore WHERE cookie_id = "+"\'"+ id +"\'";
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



      var qur = "SELECT * FROM public.user WHERE username = "+"\'"+ userName +"\'";

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
      var hash = result.rows[0].password;
      console.log("Found result: " + hash);
      bcrypt.compare(password, hash, function(err, res){
        if(err){
          console.log("issue when comparing password and hash res:"+ res);
          callback(err,null);
        }
        else if(res == true){
          callback(null, result.rows);
        }
        else{
          callback(null,false)
        }
      })
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

    var qur = "SELECT * FROM public.chat_room";
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

function getFavRoomId(userid,callback){
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

    var qur = "SELECT room_id FROM public.user_room WHERE user_id =\'" + userid + "\'";
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

function getFavRoomName(callback){
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

    var qur = "SELECT * FROM public.chat_room";
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

function addRoom(newRoomName, callback){
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

    var qur = "INSERT INTO public.chat_room (room_name) VALUES (\'"+newRoomName+"\')";
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
    callback(null, null);
    });
  });
}

function addFavRoom(roomInfo, callback){
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

    var qur = "INSERT INTO public.user_room (user_id,room_id) VALUES ("+roomInfo.userId+","+roomInfo.roomId+")";
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
    callback(null, null);
    });
  });
}

function deleteRoom(roomInfo, callback){
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

    var qur = "DELETE FROM public.user_room WHERE user_id =\'"+roomInfo.userId+"\' AND room_id =\'"+roomInfo.roomId+"\'";
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
    callback(null, null);
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
      console.log("msg is the same as room");
    }

    socket.join(msg);
  });

  //this socket.on recives the messege and emit mesg
  socket.on('chat message', function(msg){
    io.to(msg.room).emit('chat message',msg.data);
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
