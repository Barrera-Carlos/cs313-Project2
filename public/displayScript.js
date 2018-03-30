var arrOfNames = new Array();

function buildRoomForm(){
  var index = 0;
  var form = document.getElementById("listOfInput")
  $.get("/ajaxcall", function(data, status){
    for(var i = 0; i<data.length; i++){
      var input = document.createElement("INPUT");
      input.setAttribute('type', 'radio');
      input.setAttribute('name','rooms[]');
      input.setAttribute('value',String(data[i].room_name));
      var text = document.createTextNode(String(data[i].room_name));
      form.appendChild(text);
      form.appendChild(input);
    }
      });

      var input = form.getElementsByTagName("INPTU");
      console.log(input.length);
      /*for(var i = 1; i <input.length; i++){
        console.log(i);
        var br = document.createElement("BR");
        form.insertBefore(br,input[i]);
      }*/
}
