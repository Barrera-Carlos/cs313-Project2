function buildRoomForm(){
  $.get("/ajaxcall", function(data, status){
    $.each(data, function(key,value){
      $('#list').append($('<li>')).value;
    })
          //alert("Data: " + data[0].room_name + "\nStatus: " + status);
      });
}
