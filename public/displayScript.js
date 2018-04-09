var arrOfNames = new Array();

function buildRoomForm(){
  var index = 0;
  var form = document.getElementById("listOfInput");
  var favForm = document.getElementById("listOfFavInput");

  $.get("/ajaxcall", function(data, status){
    if(data.length > 0){
      $.get("/ajaxcallFav", function(favRoomName, status){
        alert(favRoomName);
        for(var i = 0; i<favRoomName.length; i++){
          var br = document.createElement("BR");
          var input = document.createElement("INPUT");
          input.setAttribute('type', 'radio');
          input.setAttribute('name','rooms[]');
          input.setAttribute('value',String(favRoomName[i]));
          var text = document.createTextNode(String(favRoomName[i]));
          favForm.appendChild(input);
          favForm.appendChild(text);
          favForm.insertBefore(br,input);
        }
        var submit = document.createElement("INPUT");
        var br = document.createElement("BR");
        submit.setAttribute('type','submit');
        submit.setAttribute('value', 'Select Room');
        favForm.appendChild(submit);
        favForm.insertBefore(br,submit);
        });
      for(var i = 0; i<data.length; i++){
        var br = document.createElement("BR");
        var input = document.createElement("INPUT");
        input.setAttribute('type', 'radio');
        input.setAttribute('name','rooms[]');
        input.setAttribute('value',String(data[i].room_name));
        var text = document.createTextNode(String(data[i].room_name));
        form.appendChild(input);
        form.appendChild(text);
        form.insertBefore(br,input);
      }
      var submit = document.createElement("INPUT");
      var br = document.createElement("BR");
      submit.setAttribute('type','submit');
      submit.setAttribute('value', 'Select Room');
      form.appendChild(submit);
      form.insertBefore(br,submit);
      }
    });
}
