$(document).ready(function () {

    //Why not add a clock for posterity
    startTime();

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
    var state="";


    //Click event
    $("#add_train").on("click", function(e) {
        //prevent page from reloading on click
        e.preventDefault();
        //assign the input value to all the variables
        name=$("#train_name").val().trim();
        destination=$("#destination").val().trim();
        //Clean up the formatting of the Destination w/ formatInput formula (bottom of page)
        destination=formatInput(destination);
        state=$("#state_name").val().trim();
        //Convert state to uppercase
        state=state.toUpperCase();
        firstTrain=$("#first_train").val().trim();
        frequency=$("#frequency").val().trim();

        //If Statement will check to make sure all fields are filled in before submission
        if ((name != "") && (destination != "") && (firstTrain != "") && (frequency != "")) {
            //log all the inputs
            console.log(name);
            console.log(destination);
            console.log(firstTrain);
            console.log(frequency);

            //push all the data to firebase
            dataRef.ref().push({
                Train_Name: name,
                Destination: destination,
                State: state,
                First_Train: firstTrain,
                Frequency: frequency
            })

            //Clear form fields
            $("#train_name").val("");
            $("#destination").val("");
            $("#first_train").val("");
            $("#frequency").val("");
            $("#state_name").val("");

            //Return Borders to normal
            $("#frequency").css({"border": "2px solid #ced4da"});
            $("#first_train").css({"border": "2px solid #ced4da"});
            $("#destination").css({"border": "2px solid #ced4da"});
            $("#train_name").css({"border": "2px solid #ced4da"});
            $("#state_name").css({"border": "2px solid #ced4da"});

        }
        //If all fields are empty, change all borders to red
        else if ((name == "Please select") && (destination == "") && (state == "--") && (firstTrain == "") && (frequency == "")) {
            $("#frequency").css({"border": "2px solid red"});
            $("#first_train").css({"border": "2px solid red"});
            $("#destination").css({"border": "2px solid red"});
            $("#state_name").css({"border": "2px solid red"});
            $("#train_name").css({"border": "2px solid red"});
        }
        //If name field is empty, change to red
        else if (name == "Please select") {
            $("#train_name").css({"border": "2px solid red"});
            if (destination != "") {
                $("#destination").css({"border": "2px solid green"});
            }
            else if (firstTrain != "") {
                $("#first_train").css({"border": "2px solid green"});
            }
        }
        //If name field passes, check destination and change name to green
        else if (destination == "") {
            $("#destination").css({"border": "2px solid red"});
            $("#train_name").css({"border": "2px solid green"});
        }
        //If destination passes, check firstTrain field and change name/destination to green
        else if (firstTrain == "") {
            $("#first_train").css({"border": "2px solid red"});
            $("#destination").css({"border": "2px solid green"});
            $("#train_name").css({"border": "2px solid green"});
        }
        //If top 3 fields pass, check frequency field and change other 3 to green
        else if (frequency == "") {
            $("#frequency").css({"border": "2px solid red"});
            $("#first_train").css({"border": "2px solid green"});
            $("#destination").css({"border": "2px solid green"});
            $("#train_name").css({"border": "2px solid green"});
        }
    });

    //add a listener for when a new train is added to firebase
    dataRef.ref().on("child_added", function(childSnapshot) {

        //$("#current_time").text(moment().format('LT'));

        //Log all the data we pull back from Firebase
        console.log(childSnapshot.val().Train_Name);
        console.log(childSnapshot.val().Destination);
        console.log(childSnapshot.val().First_Train);
        console.log(childSnapshot.val().Frequency);

        //Calculate the 'Next Arrival' and 'Minutes Away' fields
            //What do we know?
        //1. Train comes every x minutes
        var tFrequency = childSnapshot.val().Frequency;
        console.log(tFrequency);
        //2. First train is at hh:mm
        var firstTime = childSnapshot.val().First_Train;
        console.log(firstTime);
        //3. Current Time
        var currentTime = moment();
        console.log(currentTime);
        //Now we have to convert the first train time
        var firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, "years");
        console.log(firstTimeConverted);
        //Now we get the difference between now and the converted time of the first arrival
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
        console.log(diffTime);
        //Then get time apart (remainder)
        var tRemainder = diffTime % tFrequency;
        console.log(tRemainder);
        //Calculate the minutes until the train
        var tMinutesTillTrain = tFrequency - tRemainder;
        console.log(tMinutesTillTrain);
        //Calculate when the next train will arrive
        var nextTrainUnformatted = moment().add(tMinutesTillTrain, "minutes");
        console.log(nextTrainUnformatted);
        var nextTrain = moment(nextTrainUnformatted.format("HH:mm"));
        console.log(nextTrain._i);

        //Add all this new data to the table
        $("#train_list").append("<tr><td>" + childSnapshot.val().Train_Name + "</td><td>" + childSnapshot.val().Destination + ", " + childSnapshot.val().State + "</td><td>" + childSnapshot.val().Frequency + "</td><td>" + nextTrain._i + "</td><td>" + tMinutesTillTrain + "</td>");

        // Handle the errors
    }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });

    //Clock Function
    function startTime() {
        var today = new Date();
        var h = today.getHours();
        var m = today.getMinutes();
        var s = today.getSeconds();
        m = checkTime(m);
        s = checkTime(s);
        $('#current_time').text(h + ":" + m + ":" + s);
        var t = setTimeout(startTime, 500);
    }
    // This checker will just add a zero in front of numbers < 10
    function checkTime(i) {
        if (i < 10) {i = "0" + i};  
        return i;
    }

    //This function formats the user's input and capitalizes the first letter of each word
    function formatInput(destination) {
        return destination.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }   


});