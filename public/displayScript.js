var arrOfNames = new Array();

function buildRoomForm(){
  var index = 0;
  var div = document.getElementById("listOfInput")
  $.get("/ajaxcall", function(data, status){
    for(var i = 0; i<data.length; i++){
      var input = document.createElement("INPUT");
      input.setAttribute('type', 'radio');
      input.setAttribute('name','rooms[]');
      input.setAttribute('value',String(data[i].room_name));
      var text = document.createTextNode(String(data[i].room_name);
      div.appendChild(text);
      div.appendChild(input);
    }
      });
      var br = document.createElement("BR");
      for(var i = 1; i < div.childElementCount; i++){
        div.insertBefore(br,div.childNodes[i]);
      }
}
