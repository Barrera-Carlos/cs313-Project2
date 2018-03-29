function buildRoomForm(){
  var ul = document.getElementById("list")
  ul.style = "list-style-type:none"
  $.get("/ajaxcall", function(data, status){
    for(var i = 0; i<data.length; i++){
      var li = document.createElement("LI");
      var text = document.createTextNode(data[i].room_name );
      li.appendChild(text);
      console.log(li.innerHTML);
      li.style.cursor = "pointer";
      li.onclick = function(){selectRoom()};
      ul.appendChild(li);
    }
      });
}

function selectRoom(listId){
  //alert(listId);
  var formInput = document.getElementById('dataHolder');

}
