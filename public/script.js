/*
//start connection
var socket = io();

//Query DOM
var message = document.getElementById("message");
var list = document.getElementById("list");
var btn = document.getElementById("submit");

//Emmit events
btn.addEventListener('click',function(){
  socket.emit('chat message', message.value);
});

//listen for event
socket.on('chat message', function(msg){
  var child = document.createElement("LI");
  var textnode = document.createTextNode(msg);
  child.appendChild(textnode);
  list.appendChild(child);
});
*/


$( document ).ready(function() {
//$(function () {
var roomName = ""

$.get("/enterRoom", function(data,status){
  if(data != null){
    roomName = data;
  }
  if(roomName != ""){
    //start connection
    var socket = io();

    socket.emit('join',roomName);
    //on form clic/submit event emit/sent message
    $('form').submit(function(){
      socket.emit('chat message', $('#message').val());
      $('#message').val('');
      return false;
    });

    //listen for event (messages sent) and display on html page
    socket.on('chat message', function(msg){
      $('#list').append($('<li>').text(msg));
      window.scrollTo(0, document.body.scrollHeight);
    });
  }
  else{
    //start connection
    var socket = io();

    //on form clic/submit event emit/sent message
    $('form').submit(function(){
      socket.emit('chat message', $('#message').val());
      $('#message').val('');
      return false;
    });

    //listen for event (messages sent) and display on html page
    socket.on('chat message', function(msg){
      $('#list').append($('<li>').text(msg));
      window.scrollTo(0, document.body.scrollHeight);
    });
  }
})

  /*socket.on('chat message', function(msg){
    $('#list').append($('<li>').text(msg));
    window.scrollTo(0, document.body.scrollHeight);
  });*/
});
