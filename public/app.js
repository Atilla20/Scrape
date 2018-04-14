//Grab articles as a json

$.getJSON("/articles", function(data) {
    //For each article
    for(var i = 0; i < data.length; i++) {
       //Display info on page
       $("#articles").append("<p data-id=' " + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    }
});

//Whenever someone clicks a p tag
$(document).on("click", "p", function() {
//Save the id from the p tag
var thisId = $(this).attr("data-id");

//ajax call for the Article
$.ajax({
    method: "GET", 
    url: "/articles/" + thisId
})
//then add note info to page
.then(function(data) {
    console.log(data);
    //title of article
    $("#notes").append("<h2>" + data.title + "</h2>");
    //An input to enter a new title
    $("#notes").append("<input id='titleinput' name='title >");
    //A textarea to add a new note body
    $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
    //A button for submitting a new new note, with id of article saved to it
    $("#notes").append("<button data-id='" + data._id + "'id='savenote'> Save Note</button");

   // If there's a note in the article already
   if (data.note) {
       //put title of note in the title input
       $("#titleinput").val(data.note.title);
       //Place body of note in the body textarea
       $("#bodyinput").val(data.note.body);
   }
});
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
    //Grab id associated with arcticle from submit button
    var thisId=$(this).attr("data-id");

    //Run a POST request to change note
    $ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            //Value taken from title input
            title: $("#titleinput").val(),
            //Value taken from note textarea
            body: $("#bodyinput").val()
        }
    })
    .then(function(data) {
        //log response
        console.log(data);
    });

    //Remove values entered in input and textarea for note entry

    $("#titleinput").val("");
    $("#bodyinput").val("");
});