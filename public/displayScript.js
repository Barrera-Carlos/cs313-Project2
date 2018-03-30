var arrOfNames = new Array();

function buildRoomForm(){
  var index = 0;
  var div = document.getElementById("listOfInput")
  $.get("/ajaxcall", function(data, status){
    for(var i = 0; i<data.length; i++){
      var input = document.createElement("INPUT");
      input.setAttribute('type', 'radio');
      input.setAttribute('name','rooms[]');
      input.setAttribute('value',data[i].room_name);
      var text = document.createTextNode(data[i].room_name );
      input.appendChild(text);
      div.appendChild(input);
    }
      });

}
