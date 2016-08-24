"use strict";

// browserify require statements
let $ = require('jquery'),
    db = require("./db-interaction"),
    templates = require("./dom-builder"),
    login = require("./user");

    var userId= "";

// Using the REST API
function loadSongsToDOM() {
  console.log("Need to load some songs, buddy");
$("uiContainer--wrapper").html("");
db.getSongs()
.then(function(songData){
  console.log("songData", songData);

// this next 2 lines loops thru the firebase song key and ataches
// it as a property on each song object.
var idArr= Object.keys(songData);
idArr.forEach(function(key){
  songData[key].id= key;
});
console.log("SongObj added", songData);
templates.makeSongList(songData);
});
}

// loadSongsToDOM(); //<--Move to auth section after adding login btn

// Send newSong data to db then reload DOM with updated song data
$(document).on("click", ".save_new_btn", function() {
// call addSong and pass it the build SongObj (which builds the data)
let songObj = buildSongObj();
  db.addSong(songObj)
  .then(function (songId) {
  console.log("song saved", songId);
// this runs the function that makes the call to firebase and refreshes the song list
// for the user
  loadSongsToDOM();
});
});

// Load and populate form for editing a song
$(document).on("click", ".edit-btn", function () {
  // must get the song from firebase in order to edit it!
let songId = $(this).data("edit-id");
console.log("id?", songId);
db.getSong(songId)
.then(function(song){
  // console.log("song", song);
  // we want to send this song to our songForm via Promises.  thus, the "return"
  return templates.songForm(song, songId);

})
.then(function(finishedForm){
  console.log("finishedForm", finishedForm);
// stick it in the DOM
$(".uiContainer--wrapper").html(finishedForm);
});
});

//Save edited song to FB then reload DOM with updated song data
$(document).on("click", ".save_edit_btn", function() {
let songObj = buildSongObj(),
  songId = $(this).attr("id");
db.editSong(songObj,songId)
.then(function(data){
  loadSongsToDOM();
});

});

// Remove song then reload the DOM w/out new song
$(document).on("click", ".delete-btn", function () {
  let songId = $(this).data("delete-id");
  db.deleteSong(songId)
  .then(function(data){
    loadSongsToDOM();
  });
});


//***************************************************************
// User login section. Should ideally be in its own module
$("#auth-btn").click(function() {
  console.log("clicked auth");
  login()
  .then(function(result){
    let user = result.user;
    console.log ("logged in user", user.uid);
    userId = user.uid;
    loadSongsToDOM();
  });
});
//****************************************************************

// Helper functions for forms stuff. Nothing related to Firebase
// Build a song obj from form data.
function buildSongObj() {
    let songObj = {
    title: $("#form--title").val(),
    artist: $("#form--artist").val(),
    album: $("#form--album").val(),
    year: $("#form--year").val(),
    uid: userId

    // is this where we are going to link the userId with the songId?

  };
  return songObj;
}

// Load the new song form
$("#add-song").click(function() {
  console.log("clicked add song");
  var songForm = templates.songForm()
  .then(function(songForm) {
    $(".uiContainer--wrapper").html(songForm);
  });
});
