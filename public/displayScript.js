var arrOfNames = new Array();

function buildRoomForm(){
  var index = 0;
  var form = document.getElementById("listOfInput");
  var favForm = document.getElementById("listOfFavInput");

  $.get("/ajaxcall", function(data, status){
    if(data.length > 0){
      $.get("/ajaxcallFav", function(favRoomName, status){
        //var roomNameArr = JSON.parse(favRoomName);
        for(var i = 0; i<roomNameArr.length; i++){
          var br = document.createElement("BR");
          var input = document.createElement("INPUT");
          input.setAttribute('type', 'radio');
          input.setAttribute('name','rooms[]');
          input.setAttribute('value',String(favRoomName[i].id));
          var text = document.createTextNode(String(favRoomName[i].name));
          favForm.appendChild(input);
          favForm.appendChild(text);
          favForm.insertBefore(br,input);
        }
        createSubmit(favForm);
        createDeleteBtn(favForm);
        });
      for(var i = 0; i<data.length; i++){
        var br = document.createElement("BR");
        var input = document.createElement("INPUT");
        input.setAttribute('type', 'radio');
        input.setAttribute('name','rooms[]');
        input.setAttribute('value',String(data[i].id));
        var text = document.createTextNode(String(data[i].room_name));
        form.appendChild(input);
        form.appendChild(text);
        form.insertBefore(br,input);
      }
      createSubmit(form);
      createAddBtn(form);
      }
    });
}

function createSubmit(form){
  var submit = document.createElement("INPUT");
  var br = document.createElement("BR");
  submit.setAttribute('type','submit');
  submit.setAttribute('value', 'Select Room');
  form.appendChild(submit);
  form.insertBefore(br,submit);
}

function createDeleteBtn(form){
  var btn = document.createElement("BUTTON");
  btn.setAttribute('type','button');
  btn.innerHTML = "Delete Chat Room";
  btn.onclick=function(){
    var favForm = document.getElementById("listOfFavInput");
    favForm.action = "/deleteRoom"
    favForm.submit();
  };
  form.appendChild(btn);
  }

function createAddBtn(form){
  var btn = document.createElement("BUTTON");
  btn.setAttribute('type','button');
  btn.innerHTML = "Add Favorite Room";
  btn.onclick=function(){
    var favForm = document.getElementById("listOfInput");
    favForm.action = "/addRoomToFav"
    favForm.submit();
  };
  form.appendChild(btn);
}
