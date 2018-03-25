$(document).ready(function () {

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyAQRt_qUP9ZhbrXNUtkC4EemXU8qcz0uVo",
        authDomain: "train-schedule-d1d1b.firebaseapp.com",
        databaseURL: "https://train-schedule-d1d1b.firebaseio.com",
        projectId: "train-schedule-d1d1b",
        storageBucket: "train-schedule-d1d1b.appspot.com",
        messagingSenderId: "1069968021942"
    };
    firebase.initializeApp(config);

    var dataRef = firebase.database();

    //declare variables that will store user inputs
    var name="";
    var destination="";
    var firstTrain="";
    var frequency="";

    //HTML
    //Set up jumbotron for title
    //Set up table for the train data
    //Set up form to add a new train

    //JS - on load
    //We need to pull all info from the database and populate it to the page on page load;
    //Function will have to dynamically add a row w/ the data

    //JS - on submit click
    //store all values into a variable and clear all fields.  Prevent default.
    //feed data to firebase
    //bring data back and add to table




    //Click event
    $("#add_train").on("click", function(e) {
        //prevent page from reloading on click
        e.preventDefault();
        //assign the input value to all the variables
        name = $("#train_name").val().trim();
        destination=$("#destination").val().trim();
        firstTrain=$("#first_train").val().trim();
        frequency=$("#frequency").val().trim();

        //log all the inputs
        console.log(name);
        console.log(destination);
        console.log(firstTrain);
        console.log(frequency);

        //push all the data to firebase
        dataRef.ref().push({
            Train_Name: name,
            Destination: destination,
            First_Train: firstTrain,
            Frequency: frequency
        })

        //Clear form fields
        $("#train_name").val("");
        $("#destination").val("");
        $("#first_train").val("");
        $("#frequency").val("");
    });

    //add a listener for when a new train is added to firebase
    dataRef.ref().on("child_added", function(childSnapshot) {

        //Log all the data we pull back from Firebase
        console.log(childSnapshot.val().name);
        console.log(childSnapshot.val().destination);
        console.log(childSnapshot.val().firstTrain);
        console.log(childSnapshot.val().frequency);

        //Add all this new data to the table
        $("#train_list").append("<tr><td>" + childSnapshot.val().Train_Name + "</td><td>" + childSnapshot.val().Destination + "</td><td>" + childSnapshot.val().Frequency + "</td><td>TBD</td><td>TBD</td>");

        // Handle the errors
    }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });





});