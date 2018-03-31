//This script is used for the chat room socket.


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
      socket.emit('chat message', {data:$('#message').val(),room: roomName});
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
