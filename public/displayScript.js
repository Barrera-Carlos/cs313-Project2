function buildRoomForm(){
  $.get("/ajaxcall", function(data, status){
          alert("Data: " + data[0] + "\nStatus: " + status);
      });
}
