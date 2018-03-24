function buildRoomForm(){
  $.ajax({
    type:'GET',
    url: '/ajaxcall',
    dataType: 'json'
  })
  .done(function(data){
    console.log('GET respose:', JSON.stringify(data,"",2));
    $('#getResponse').html(JSON.stringify(data, "", 2));
  });


}
