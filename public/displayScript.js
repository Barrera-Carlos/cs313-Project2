function buildRoomForm(){
  $.get("/ajaxcall", function(data, status){
          alert("Data: " + data[0].room_name + "\nStatus: " + status);
      });
}
