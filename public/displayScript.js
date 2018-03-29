var arrOfNames = new Array();

function buildRoomForm(){
  var index = 0;
  var ul = document.getElementById("list")
  ul.style = "list-style-type:none"
  $.get("/ajaxcall", function(data, status){
    for(var i = 0; i<data.length; i++){
      var li = document.createElement("LI");
      var text = document.createTextNode(data[i].room_name );
      li.appendChild(text);
      li.style.cursor = "pointer";
      var liTextValue = li.innerHTML;
      arrOfNames.push(liTextValue);
      li.onclick = function(){selectRoom(index)};
      index++;
      ul.appendChild(li);
    }
      });
}

function selectRoom(liTextValue){
  alert(liTextValue);
  console.log(arrOfNames[liTextValue]);
  var formInput = document.getElementById('dataHolder');

}
