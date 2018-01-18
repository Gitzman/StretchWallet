//Hide Login and Logout
if (sessionStorage.getItem('uuid') == null) {
    console.log("Not logged in");
    $('.nav').hide();
}
else if (sessionStorage.getItem('uuid') != null) {
    console.log("logged in");
    $('.nav').hide();
}
//Sign up page validation for Role checkboxes
//Runs if all other values are given
$(document).ready(function () {
    $('#btn-signup').click(function() {
    //$("form").submit(function(){
      var tCheck = $("input[type=text]").val();
      var telCheck = $("input[type=tel]").val();
      var eCheck = $("input[type=email]").val();
      var pCheck = $("input[type=password]").val();
      checked = $("input[type=checkbox]:checked").length;
      if(checked) {
        $(".errorMessage").toggle();
        $(".errorMessage").hide();
        return true;
      }
      else if(tCheck && telCheck && eCheck && pCheck && !checked) {
        $(".errorMessage").toggle();
        $(".errorMessage").show();
        return false;
      }
    });
});


//Edit Profile, populate with data
//var myJSON = jQuery.parseJSON(obj);
//var myJSON = jQuery.parseJSON( '{ "firstname": "John" }')
var myJSON = $.getJSON('/profile', function(data) {

     console.log(data.info);
     $('#firstname').val(data.info.firstname);
     $('#lastname').val(data.info.lastname);
     $('#phone').val(data.info.phone);

     var myJSONArray = ["data.info.roles", "software", "skills"];
//     $.each(myJSONArray, function(i, val){
       //var dI = ["data.info." + myJSONArray[0].toString()];
       //console.log(dI.toString());
       var myJSONArrayValues = data.info.roles;
       //if (data.info.skills) {
       //myJSONArrayValues.push(data.info.skills);
       //} //software too
       console.log(myJSONArrayValues);
       $.each(myJSONArrayValues, function(i, val){
          $("input[value='" + val + "']").prop('checked', true);
        });
//     });

});

//Submit job updates
function submitform() {
  document.editJob.submit();
} 
