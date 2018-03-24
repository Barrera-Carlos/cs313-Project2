function buildRoomForm(){
  $.get("/ajaxcall", function(data, status){
          alert("Data: " + data + "\nStatus: " + status);
      });
}
