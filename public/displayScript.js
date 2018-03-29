function buildRoomForm(){
  var ul = document.getElementById("list")
  ul.style = "list-style-type:none"
  $.get("/ajaxcall", function(data, status){
    for(var i = 0; i<data.length; i++){
      var li = document.createElement("LI");
      var text = document.createTextNode(data[i].room_name );
      li.appendChild(text);
      var liTextValue = li.innerHTML;
      console.log(liTextValue);
      li.style.cursor = "pointer";
      li.onclick = function(){selectRoom(liTextValue)};
      ul.appendChild(li);
    }
      });
}

function selectRoom(liTextValue){
  alert(liTextValue);
  console.log(liTextValue);
  var formInput = document.getElementById('dataHolder');

}
