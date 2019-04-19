// NOTE: this script.js is for the about/contact page only!
$(document).ready(function() {
    var config = {
        apiKey: "AIzaSyDkgxPmixwa3I9MTW-TuWkQZvBEqgbr1vE",
        authDomain: "https://classwork-f3f0e.firebaseio.com/",
        databaseURL: "https://classwork-f3f0e.firebaseio.com/",
        projectId: "project-1-d5c4e",
        storageBucket: "project-1-d5c4e.appspot.com",
        messagingSenderId: "987108784434"
      };

      firebase.initializeApp(config);
      var database = firebase.database()
      $("#contactBtn").on("click",function() {
       var firstName = $("#firstName").val()
       var lastName = $("#lastName").val().trim();
       var emailInput = $("#emailInput").val().trim();
       var commentInput = $("#commentInput").val().trim(); 
    //    console.log(firstName);
    //    console.log(lastName);
    //    console.log(emailInput);
    //    console.log(commentInput);
    var contact = {
        firstName: firstName,
        lastName: lastName,
        emailInput: emailInput,
        commentInput: commentInput
    }
    database.ref("/contact").push(contact);
      });
});