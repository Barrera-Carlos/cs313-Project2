function buildRoomForm(){
  var ul = document.getElementById("list")

  $.get("/ajaxcall", function(data, status){
    for(var i = 0; i<data.length; i++){
      var li = document.createElement("LI");
      var text = document.createTextNode(data[i].room_name );
      li.appendChild(text);
      ul.appendChild(li);
    }
          //alert("Data: " + data[0].room_name + "\nStatus: " + status);
      });
}
