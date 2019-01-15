$(document).ready(() => {

  //Why not add a clock for posterity
  startTime();

  // Initialize Firebase
  const config = {
    apiKey: "AIzaSyAQRt_qUP9ZhbrXNUtkC4EemXU8qcz0uVo",
    authDomain: "train-schedule-d1d1b.firebaseapp.com",
    databaseURL: "https://train-schedule-d1d1b.firebaseio.com",
    projectId: "train-schedule-d1d1b",
    storageBucket: "train-schedule-d1d1b.appspot.com",
    messagingSenderId: "1069968021942"
  };
  firebase.initializeApp(config);

  const dataRef = firebase.database();

  //declare letiables that will store user inputs
  let name="";
  let destination="";
  let firstTrain="";
  let frequency="";
  let state="";
  //This is going to be used for form validation
  let userInputsArray=[];
  let formErrorArray=[$("#train_name"), $("#destination"), $("#state_name"), $("#first_train"), $("#frequency")];

  //Click event
  $("#add_train").on("click", e => {
    userInputsArray=[];
    //prevent page from reloading on click
    e.preventDefault();
    //assign the input value to all the letiables
    name=$("#train_name").val().trim();
    destination=$("#destination").val().trim();
    //Clean up the formatting of the Destination w/ formatInput formula (bottom of page)
    destination=formatInput(destination);
    state=$("#state_name").val().trim();
    firstTrain=$("#first_train").val().trim();
    frequency=$("#frequency").val().trim();
    userInputsArray.push(name, destination, state, firstTrain, frequency);

    //If Statement will check to make sure all fields are filled in before submission
    if ((name != "") && (destination != "") && (firstTrain != "") && (state != "") && (frequency != "")) {
      //push all the data to firebase
      dataRef.ref().push({
        Train_Name: name,
        Destination: destination,
        State: state,
        First_Train: firstTrain,
        Frequency: frequency
      })

      //Clear form fields & return borders to normal
      $("#train_name").val("").css({"border": "2px solid #ced4da"});
      $("#destination").val("").css({"border": "2px solid #ced4da"});
      $("#first_train").val("").css({"border": "2px solid #ced4da"});
      $("#frequency").val("").css({"border": "2px solid #ced4da"});
      $("#state_name").val("").css({"border": "2px solid #ced4da"});

      $(".form_header").text("New Train Form").css({"color": "black", "font-weight":"500"});
    }
    else {
      userInputsArray.map((val, i) => {
        (val == "") ? formErrorArray[i].css({"border": "2px solid red"}) : formErrorArray[i].css({"border": "2px solid green"});

        $(".form_header").text("Please fix the red fields below and resubmit").css({"color": "red", "font-weight": "bolder"});
      })
    }       
  });

    //add a listener for when a new train is added to firebase
    dataRef.ref().on("child_added", function(childSnapshot) {
      //Calculate the 'Next Arrival' and 'Minutes Away' fields
      //1. Train comes every x minutes
      let tFrequency = childSnapshot.val().Frequency;
      //2. First train is at hh:mm
      let firstTime = childSnapshot.val().First_Train;
      //3. Current Time
      let currentTime = moment();
      //Now we have to convert the first train time
      let firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, "years");
      //Now we get the difference between now and the converted time of the first arrival
      let diffTime = moment().diff(moment(firstTimeConverted), "minutes");
      //Then get time apart (remainder)
      let tRemainder = diffTime % tFrequency;
      //Calculate the minutes until the train
      let tMinutesTillTrain = tFrequency - tRemainder;
      //Calculate when the next train will arrive
      let nextTrainUnformatted = moment().add(tMinutesTillTrain, "minutes");
      let nextTrain = moment(nextTrainUnformatted.format("HH:mm"));
      // console.log(nextTrain._i);

      //Add all this new data to the table
      $("#train_list").append(`<tr><td>${childSnapshot.val().Train_Name}</td><td>${childSnapshot.val().Destination}, ${childSnapshot.val().State}</td><td>${childSnapshot.val().Frequency}</td><td>${nextTrain._i}</td><td>${tMinutesTillTrain}</td>`);

        // Handle the errors
    }, errorObject => {//console.log("Errors handled: " + errorObject.code);
        });

    //Clock Function
    function startTime() {
      let today = new Date();
      let h = today.getHours();
      let m = today.getMinutes();
      let s = today.getSeconds();
      m = checkTime(m);
      s = checkTime(s);
      $('#current_time').text(`${h}:${m}:${s}`);
      setTimeout(startTime, 500);
    }
    // This checker will just add a zero in front of numbers < 10
    function checkTime(i) {
      if (i < 10) {i = "0" + i};  
      return i;
    }

    //This function formats the user's input and capitalizes the first letter of each word
    function formatInput(destination) {
      return destination.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }   
});